import { useEffect, useState } from 'react'
import { getPedidos, crearPedido, cambiarEstadoPedido, getMesas, getMenu } from '../../services/api'
import { PageHeader, Modal, Select, Btn, Badge, Card, Table, Tr, Td } from '../../components/ui'
import toast from 'react-hot-toast'

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [mesas, setMesas] = useState([])
  const [menu, setMenu] = useState([])
  const [modal, setModal] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [form, setForm] = useState({ mesaId: '', tipoPedido: 'MESA', clienteNombre: '', direccionEntrega: '', items: [] })
  const [itemTemp, setItemTemp] = useState({ productoId: '', cantidad: 1, notas: '' })

  const cargar = () => getPedidos().then(r => setPedidos(r.data.data || []))

  useEffect(() => {
    cargar()
    getMesas().then(r => setMesas(r.data.data || []))
    getMenu().then(r => setMenu(r.data.data || []))
  }, [])

  const agregarItem = () => {
    if (!itemTemp.productoId) return toast.error('Selecciona un producto')
    const producto = menu.find(p => p.id == itemTemp.productoId)
    const existe = form.items.find(i => i.productoId == itemTemp.productoId)
    if (existe) {
      setForm({ ...form, items: form.items.map(i => i.productoId == itemTemp.productoId ? { ...i, cantidad: i.cantidad + itemTemp.cantidad } : i) })
    } else {
      setForm({ ...form, items: [...form.items, { ...itemTemp, nombreProducto: producto?.nombre, precio: producto?.precio }] })
    }
    setItemTemp({ productoId: '', cantidad: 1, notas: '' })
  }

  const total = form.items.reduce((acc, i) => acc + (i.precio || 0) * i.cantidad, 0)

  const guardar = async (e) => {
    e.preventDefault()
    if (form.items.length === 0) return toast.error('Agrega al menos un producto')
    if (form.tipoPedido === 'DOMICILIO' && !form.direccionEntrega.trim()) return toast.error('Ingresa la dirección de entrega')
    try {
      const payload = {
        mesaId: form.mesaId || null,
        tipoPedido: form.tipoPedido,
        clienteNombre: form.clienteNombre,
        direccionEntrega: form.tipoPedido === 'DOMICILIO' ? form.direccionEntrega : null,
        items: form.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad, notas: i.notas }))
      }
      await crearPedido(payload)
      toast.success('Pedido creado exitosamente')
      setModal(false)
      setForm({ mesaId: '', tipoPedido: 'MESA', clienteNombre: '', direccionEntrega: '', items: [] })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear pedido')
    }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoPedido(id, estado)
      toast.success('Estado actualizado')
      cargar()
      if (detalle?.id === id) setDetalle(prev => ({ ...prev, estado }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const estadosSiguientes = {
    PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
    EN_PREPARACION: ['LISTO', 'CANCELADO'],
    LISTO: ['SERVIDO'],
    SERVIDO: [], PAGADO: [], CANCELADO: [],
  }

  const labelBtn = { EN_PREPARACION: 'Iniciar', LISTO: 'Listo', SERVIDO: 'Servido', CANCELADO: 'Cancelar' }

  return (
    <div className="fade-in">
      <PageHeader
        title="Pedidos"
        sub={`${pedidos.length} pedidos activos`}
        action={<Btn onClick={() => setModal(true)}>+ Nuevo Pedido</Btn>}
      />

      <Card>
        <Table headers={['Pedido', 'Mesa/Tipo', 'Dirección', 'Mesero', 'Items', 'Total', 'Estado', 'Acciones']}>
          {pedidos.map(p => (
            <Tr key={p.id} onClick={() => setDetalle(p)}>
              <Td><span style={{ color: '#f97316', fontWeight: '600', fontSize: '13px' }}>{p.numeroPedido}</span></Td>
              <Td>
                <div>{p.mesa || p.tipoPedido}</div>
                {p.tipoPedido === 'DOMICILIO' && <div style={{ fontSize: 11, color: '#f97316' }}>🛵 Domicilio</div>}
              </Td>
              <Td>
                {p.direccionEntrega
                  ? <span style={{ fontSize: 12, color: '#93c5fd', background: '#1e3a5f', padding: '2px 8px', borderRadius: 6 }}>📍 {p.direccionEntrega.substring(0, 25)}{p.direccionEntrega.length > 25 ? '...' : ''}</span>
                  : <span style={{ color: '#444', fontSize: 12 }}>—</span>}
              </Td>
              <Td>{p.mesero}</Td>
              <Td>{p.items?.length || 0}</Td>
              <Td><span style={{ color: '#f0f0f0', fontWeight: '600' }}>${Number(p.total || 0).toLocaleString()}</span></Td>
              <Td><Badge estado={p.estado} /></Td>
              <Td>
                <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                  {(estadosSiguientes[p.estado] || []).map(s => (
                    <button key={s} onClick={() => cambiarEstado(p.id, s)} style={{
                      background: s === 'CANCELADO' ? '#450a0a' : '#1e3a5f', border: 'none', borderRadius: '6px',
                      padding: '4px 10px', color: s === 'CANCELADO' ? '#fca5a5' : '#93c5fd', fontSize: '11px', cursor: 'pointer', fontWeight: '600'
                    }}>
                      {labelBtn[s]}
                    </button>
                  ))}
                </div>
              </Td>
            </Tr>
          ))}
          {pedidos.length === 0 && (
            <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#555', fontSize: '14px' }}>No hay pedidos activos</td></tr>
          )}
        </Table>
      </Card>

      {/* Modal detalle */}
      {detalle && (
        <Modal title={`Pedido ${detalle.numeroPedido}`} onClose={() => setDetalle(null)} width="600px">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Badge estado={detalle.estado} />
            <span style={{ color: '#666', fontSize: '13px' }}>{detalle.fechaCreacion?.slice(0, 16).replace('T', ' ')}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div><span style={{ color: '#666', fontSize: '12px' }}>Mesa/Tipo</span><div style={{ color: '#f0f0f0', fontWeight: '600' }}>{detalle.mesa || detalle.tipoPedido}</div></div>
            <div><span style={{ color: '#666', fontSize: '12px' }}>Mesero</span><div style={{ color: '#f0f0f0', fontWeight: '600' }}>{detalle.mesero}</div></div>
            {detalle.clienteNombre && <div><span style={{ color: '#666', fontSize: '12px' }}>Cliente</span><div style={{ color: '#f0f0f0', fontWeight: '600' }}>{detalle.clienteNombre}</div></div>}
          </div>

          {/* Dirección si es domicilio */}
          {detalle.direccionEntrega && (
            <div style={{ background: '#1e3a5f22', border: '1px solid #1e3a5f', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8 }}>
              <span>📍</span>
              <div>
                <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600, marginBottom: 2 }}>DIRECCIÓN DE ENTREGA</div>
                <div style={{ color: '#f0f0f0', fontSize: 14 }}>{detalle.direccionEntrega}</div>
              </div>
            </div>
          )}

          <div style={{ background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            {detalle.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #222' }}>
                <div>
                  <div style={{ color: '#f0f0f0', fontSize: '14px', fontWeight: '500' }}>{item.producto}</div>
                  {item.notas && <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>📝 {item.notas}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#ccc', fontSize: '13px' }}>x{item.cantidad}</div>
                  <div style={{ color: '#f97316', fontWeight: '600' }}>${Number(item.subtotal || 0).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: '800', color: '#f97316' }}>
              Total: ${Number(detalle.total || 0).toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(estadosSiguientes[detalle.estado] || []).map(s => (
                <Btn key={s} variant={s === 'CANCELADO' ? 'danger' : 'primary'} onClick={() => cambiarEstado(detalle.id, s)}>
                  {s === 'EN_PREPARACION' ? 'Iniciar prep.' : s === 'LISTO' ? 'Marcar listo' : s === 'SERVIDO' ? 'Marcar servido' : 'Cancelar'}
                </Btn>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal crear pedido */}
      {modal && (
        <Modal title="Nuevo Pedido" onClose={() => setModal(false)} width="640px">
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select label="Tipo de pedido" value={form.tipoPedido} onChange={e => setForm({ ...form, tipoPedido: e.target.value, mesaId: '', direccionEntrega: '' })}>
                <option value="MESA">🪑 Mesa</option>
                <option value="DOMICILIO">🛵 Domicilio</option>
                <option value="PARA_LLEVAR">🥡 Para llevar</option>
              </Select>
              {form.tipoPedido === 'MESA' && (
                <Select label="Mesa" value={form.mesaId} onChange={e => setForm({ ...form, mesaId: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {mesas.filter(m => m.estado === 'LIBRE' || m.estado === 'OCUPADA').map(m => (
                    <option key={m.id} value={m.id}>Mesa {m.numero} — {m.zona}</option>
                  ))}
                </Select>
              )}
              {form.tipoPedido !== 'MESA' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>Nombre del cliente</label>
                  <input value={form.clienteNombre} onChange={e => setForm({ ...form, clienteNombre: e.target.value })}
                    placeholder="Nombre del cliente"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 13px', color: '#f0f0f0', fontSize: '14px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                </div>
              )}
            </div>

            {/* Campo dirección solo para domicilio */}
            {form.tipoPedido === 'DOMICILIO' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>
                  📍 Dirección de entrega <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={form.direccionEntrega}
                  onChange={e => setForm({ ...form, direccionEntrega: e.target.value })}
                  placeholder="Ej: Cra 50 #45-23, Barrio Centro, apto 301"
                  required
                  style={{ width: '100%', background: '#1e3a5f22', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f0', fontSize: '14px', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#1e3a5f'}
                />
                <div style={{ fontSize: 11, color: '#4a7fbf', marginTop: 4 }}>Incluye barrio, número de apartamento o referencia si aplica</div>
              </div>
            )}

            {/* Agregar productos */}
            <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '600', marginBottom: '12px' }}>AGREGAR PRODUCTOS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'end' }}>
                <Select label="" value={itemTemp.productoId} onChange={e => setItemTemp({ ...itemTemp, productoId: e.target.value })} style={{ marginBottom: 0 }}>
                  <option value="">Seleccionar producto</option>
                  {menu.map(p => <option key={p.id} value={p.id}>{p.nombre} — ${Number(p.precio).toLocaleString()}</option>)}
                </Select>
                <input type="number" min="1" value={itemTemp.cantidad} onChange={e => setItemTemp({ ...itemTemp, cantidad: parseInt(e.target.value) || 1 })}
                  style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 12px', color: '#f0f0f0', width: '70px', fontSize: '14px', outline: 'none' }} />
                <Btn onClick={agregarItem} type="button">+ Agregar</Btn>
              </div>
            </div>

            {/* Lista items */}
            {form.items.length > 0 && (
              <div style={{ background: '#161616', borderRadius: '12px', marginBottom: '14px', overflow: 'hidden' }}>
                {form.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #1e1e1e' }}>
                    <span style={{ color: '#f0f0f0', fontSize: '13px' }}>{item.nombreProducto}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#f97316', fontSize: '13px', fontWeight: '600' }}>x{item.cantidad} — ${((item.precio || 0) * item.cantidad).toLocaleString()}</span>
                      <button type="button" onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>×</button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: '800', color: '#f97316' }}>
                    Total: ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setModal(false)} type="button">Cancelar</Btn>
              <Btn type="submit">Crear Pedido</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
