import { useEffect, useState } from 'react'
import { getFacturas, crearFactura, getPedidos } from '../../services/api'
import { PageHeader, Modal, Select, Btn, Badge, Card, Table, Tr, Td } from '../../components/ui'
import toast from 'react-hot-toast'

const METODOS = ['EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA']

function imprimirFactura(f) {
  const win = window.open('', '_blank', 'width=400,height=600')
  win.document.write(`
    <html><head><title>Factura ${f.numeroFactura}</title>
    <style>
      body { font-family: 'Courier New', monospace; font-size: 13px; margin: 0; padding: 16px; max-width: 320px; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .line { border-top: 1px dashed #000; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; margin: 3px 0; }
      .title { font-size: 20px; font-weight: bold; }
      .total { font-size: 16px; font-weight: bold; }
      @media print { button { display: none; } }
    </style></head>
    <body>
      <div class="center">
        <div class="title">🔥 Fast &  Healthy 🔥</div>
        <div>Barrio parroquial, diagonal al supermercado</div>
        <div>Tel: 3155400005</div>
      </div>
      <div class="line"></div>
      <div class="row"><span class="bold">Factura:</span><span>${f.numeroFactura}</span></div>
      <div class="row"><span class="bold">Pedido:</span><span>${f.pedidoNumero || f.pedido || '—'}</span></div>
      <div class="row"><span class="bold">Fecha:</span><span>${(f.fecha || f.fechaEmision) ? new Date(f.fecha || f.fechaEmision).toLocaleString('es-CO') : '—'}</span></div>
      ${f.clienteNombre ? `<div class="row"><span class="bold">Cliente:</span><span>${f.clienteNombre}</span></div>` : ''}
      ${f.cajero ? `<div class="row"><span class="bold">Cajero:</span><span>${f.cajero}</span></div>` : ''}
      <div style="text-align:center;margin:12px 0 4px 0"><div style="font-size:10px;color:#999;margin-bottom:5px">Escanea para más info</div><img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://fast-healthy.railway.app/login" alt="QR" style="width:80px;height:80px" /></div>
      <div class="line"></div>
      <div class="bold">DETALLE:</div>
      ${(f.items || []).map(i => `
        <div class="row"><span>${i.producto || i.nombre} x${i.cantidad}</span><span>$${Number(i.subtotal||0).toLocaleString()}</span></div>
      `).join('')}
      <div class="line"></div>
      <div class="row"><span>Subtotal:</span><span>$${Number(f.subtotal||0).toLocaleString()}</span></div>
      ${f.descuento && Number(f.descuento) > 0 ? `<div class="row"><span>Descuento:</span><span>-$${Number(f.descuento).toLocaleString()}</span></div>` : ''}
      ${f.propina && Number(f.propina) > 0 ? `<div class="row"><span>Propina:</span><span>$${Number(f.propina).toLocaleString()}</span></div>` : ''}
      ${f.impuesto && Number(f.impuesto) > 0 ? `<div class="row"><span>IVA:</span><span>$${Number(f.impuesto).toLocaleString()}</span></div>` : ''}
      <div class="line"></div>
      <div class="row total"><span>TOTAL:</span><span>$${Number(f.montoTotal||f.total||0).toLocaleString()}</span></div>
      <div class="row"><span>Método pago:</span><span>${f.metodoPago || '—'}</span></div>
      ${f.montoPagado ? `<div class="row"><span>Pagó:</span><span>$${Number(f.montoPagado).toLocaleString()}</span></div>` : ''}
      ${f.cambio ? `<div class="row"><span>Cambio:</span><span>$${Number(f.cambio).toLocaleString()}</span></div>` : ''}
      <div class="line"></div>
      <div class="center">¡Gracias por su visita!</div>
      <div class="center" style="margin-top:8px">
        <button onclick="window.print()" style="padding:8px 20px;font-size:14px;cursor:pointer">🖨️ Imprimir</button>
      </div>
    </body></html>
  `)
  win.document.close()
  setTimeout(() => win.print(), 300)
}

export default function Facturas() {
  const [facturas, setFacturas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [modal, setModal] = useState(false)
  const [detalleModal, setDetalleModal] = useState(null)
  const [filtro, setFiltro] = useState('HOY')
  const [form, setForm] = useState({ pedidoId: '', metodoPago: 'EFECTIVO', descuento: 0, propina: 0, montoPagado: '', clienteNombre: '' })

  const cargar = () => {
    getFacturas().then(r => setFacturas(r.data.data || []))
    getPedidos().then(r => setPedidos((r.data.data || []).filter(p => p.estado === 'SERVIDO')))
  }

  useEffect(() => { cargar() }, [])

  const facturasFiltradas = (() => {
    const ahora = new Date()
    const hoy = ahora.toISOString().split('T')[0]
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - 7)
    const mesActual = ahora.getMonth()
    const anioActual = ahora.getFullYear()
    const getFecha = (f) => f.fecha || f.fechaEmision || null
    if (filtro === 'HOY') return facturas.filter(f => {
      const fecha = getFecha(f)
      return fecha && new Date(fecha).toISOString().split('T')[0] === hoy
    })
    if (filtro === 'SEMANA') return facturas.filter(f => {
      const fecha = getFecha(f)
      return fecha && new Date(fecha) >= inicioSemana
    })
    if (filtro === 'MES') return facturas.filter(f => {
      const fecha = getFecha(f)
      if (!fecha) return false
      const d = new Date(fecha)
      return d.getMonth() === mesActual && d.getFullYear() === anioActual
    })
    return facturas
  })()

  const totalFiltrado = facturasFiltradas.filter(f => f.estado === 'EMITIDA').reduce((a, f) => a + Number(f.montoTotal || f.total || 0), 0)

  const pedidoSel = pedidos.find(p => p.id == form.pedidoId)
  const subtotal = pedidoSel ? Number(pedidoSel.total || 0) : 0
  const totalFinal = subtotal - Number(form.descuento || 0) + Number(form.propina || 0)
  const cambio = form.montoPagado ? Math.max(0, Number(form.montoPagado) - totalFinal) : 0

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.pedidoId) return toast.error('Selecciona un pedido')
    try {
      await crearFactura({
        pedidoId: Number(form.pedidoId),
        metodoPago: form.metodoPago,
        descuento: Number(form.descuento) || 0,
        propina: Number(form.propina) || 0,
        montoPagado: Number(form.montoPagado) || totalFinal,
        clienteNombre: form.clienteNombre || null
      })
      toast.success('Factura creada')
      setModal(false)
      setForm({ pedidoId: '', metodoPago: 'EFECTIVO', descuento: 0, propina: 0, montoPagado: '', clienteNombre: '' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear factura')
    }
  }

  const colorFiltro = (v) => ({
    background: filtro === v ? '#f97316' : '#1a1a1a',
    border: `1px solid ${filtro === v ? '#f97316' : '#2a2a2a'}`,
    borderRadius: 8, padding: '6px 14px', color: filtro === v ? '#fff' : '#888',
    fontSize: 12, fontWeight: 600, cursor: 'pointer'
  })

  return (
    <div className="fade-in">
      <PageHeader
        title="Facturas"
        sub={`${facturasFiltradas.length} facturas — Total: $${totalFiltrado.toLocaleString()}`}
        action={<Btn onClick={() => setModal(true)}>+ Nueva Factura</Btn>}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['HOY', 'Hoy'], ['SEMANA', 'Esta semana'], ['MES', 'Este mes'], ['TODAS', 'Todas']].map(([v, l]) => (
          <button key={v} style={colorFiltro(v)} onClick={() => setFiltro(v)}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total recaudado', value: `$${totalFiltrado.toLocaleString()}`, color: '#22c55e' },
          { label: 'Facturas emitidas', value: facturasFiltradas.filter(f => f.estado === 'EMITIDA').length, color: '#3b82f6' },
          { label: 'Ticket promedio', value: facturasFiltradas.filter(f => f.estado === 'EMITIDA').length ? `$${Math.round(totalFiltrado / facturasFiltradas.filter(f => f.estado === 'EMITIDA').length).toLocaleString()}` : '$0', color: '#f97316' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <Table headers={['Factura', 'Pedido', 'Cliente', 'Subtotal', 'Total', 'Método', 'Estado', 'Acciones']}>
          {facturasFiltradas.map(f => (
            <Tr key={f.id} onClick={() => setDetalleModal(f)}>
              <Td>
                <span style={{ color: '#f97316', fontWeight: 600, fontSize: 13 }}>{f.numeroFactura}</span>
                <div style={{ color: '#555', fontSize: 11 }}>{(f.fecha || f.fechaEmision) ? new Date(f.fecha || f.fechaEmision).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</div>
              </Td>
              <Td>{f.pedidoNumero || f.pedido || '—'}</Td>
              <Td>{f.clienteNombre || <span style={{ color: '#444' }}>—</span>}</Td>
              <Td>${Number(f.subtotal || 0).toLocaleString()}</Td>
              <Td><span style={{ color: '#f0f0f0', fontWeight: 700 }}>${Number(f.montoTotal || f.total || 0).toLocaleString()}</span></Td>
              <Td><span style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#ccc' }}>{f.metodoPago || '—'}</span></Td>
              <Td><Badge estado={f.estado} /></Td>
              <Td>
                <button onClick={e => { e.stopPropagation(); imprimirFactura(f) }} style={{ background: '#1c3a2a', border: '1px solid #166534', borderRadius: 6, padding: '4px 10px', color: '#86efac', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                  🖨️ Imprimir
                </button>
              </Td>
            </Tr>
          ))}
          {facturasFiltradas.length === 0 && (
            <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: '#555' }}>
              No hay facturas {filtro === 'HOY' ? 'hoy' : filtro === 'SEMANA' ? 'esta semana' : filtro === 'MES' ? 'este mes' : ''}
            </td></tr>
          )}
        </Table>
      </Card>

      {detalleModal && (
        <Modal title={`Factura ${detalleModal.numeroFactura}`} onClose={() => setDetalleModal(null)} width="500px">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Badge estado={detalleModal.estado} />
            <span style={{ color: '#666', fontSize: 12 }}>{(detalleModal.fecha || detalleModal.fechaEmision) ? new Date(detalleModal.fecha || detalleModal.fechaEmision).toLocaleString('es-CO') : ''}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              ['Pedido', detalleModal.pedidoNumero || detalleModal.pedido || '—'],
              ['Cliente', detalleModal.clienteNombre || '—'],
              ['Cajero', detalleModal.cajero || '—'],
              ['Método', detalleModal.metodoPago],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: '#666' }}>{k}</div>
                <div style={{ fontSize: 14, color: '#f0f0f0', fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          {detalleModal.items?.length > 0 && (
            <div style={{ background: '#1a1a1a', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
              {detalleModal.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #222' }}>
                  <span style={{ color: '#ccc', fontSize: 13 }}>{item.producto || item.nombre} x{item.cantidad}</span>
                  <span style={{ color: '#f97316', fontWeight: 600 }}>${Number(item.subtotal || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            {[
              ['Subtotal', detalleModal.subtotal],
              detalleModal.descuento && Number(detalleModal.descuento) > 0 ? ['Descuento', `-${Number(detalleModal.descuento).toLocaleString()}`] : null,
              detalleModal.propina && Number(detalleModal.propina) > 0 ? ['Propina', detalleModal.propina] : null,
              detalleModal.impuesto && Number(detalleModal.impuesto) > 0 ? ['IVA', detalleModal.impuesto] : null,
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#888' }}>
                <span>{k}</span><span>${typeof v === 'string' ? v : Number(v || 0).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #2a2a2a', fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800, color: '#f97316' }}>
              <span>TOTAL</span><span>${Number(detalleModal.montoTotal || detalleModal.total || 0).toLocaleString()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => imprimirFactura(detalleModal)} style={{ background: '#14532d', border: 'none', borderRadius: 10, padding: '12px 32px', color: '#86efac', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
              🖨️ Imprimir Factura
            </button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title="Nueva Factura" onClose={() => setModal(false)} width="520px">
          <form onSubmit={guardar}>
            <Select label="Pedido a facturar" required value={form.pedidoId} onChange={e => setForm({ ...form, pedidoId: e.target.value })}>
              <option value="">Seleccionar pedido servido</option>
              {pedidos.map(p => <option key={p.id} value={p.id}>{p.numeroPedido} — {p.mesa || p.tipoPedido} — ${Number(p.total || 0).toLocaleString()}</option>)}
            </Select>

            {pedidoSel && (
              <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>RESUMEN DEL PEDIDO</div>
                {pedidoSel.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ccc', marginBottom: 4 }}>
                    <span>{item.producto} x{item.cantidad}</span>
                    <span>${Number(item.subtotal || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #2a2a2a', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#f97316' }}>
                  <span>Subtotal</span><span>${subtotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 6, fontWeight: 500 }}>Nombre del cliente (opcional)</label>
              <input value={form.clienteNombre} onChange={e => setForm({ ...form, clienteNombre: e.target.value })} placeholder="Nombre del cliente"
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 13px', color: '#f0f0f0', fontSize: 14, outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 6, fontWeight: 500 }}>Descuento ($)</label>
                <input type="number" min="0" value={form.descuento} onChange={e => setForm({ ...form, descuento: e.target.value })}
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 13px', color: '#f0f0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 6, fontWeight: 500 }}>Propina ($)</label>
                <input type="number" min="0" value={form.propina} onChange={e => setForm({ ...form, propina: e.target.value })}
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 13px', color: '#f0f0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <Select label="Método de pago" value={form.metodoPago} onChange={e => setForm({ ...form, metodoPago: e.target.value })}>
              {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 6, fontWeight: 500 }}>Monto pagado ($)</label>
              <input type="number" min="0" value={form.montoPagado} onChange={e => setForm({ ...form, montoPagado: e.target.value })} placeholder={`Mínimo: $${totalFinal.toLocaleString()}`}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 13px', color: '#f0f0f0', fontSize: 14, outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#888' }}><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              {Number(form.descuento) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#ef4444' }}><span>Descuento</span><span>-${Number(form.descuento).toLocaleString()}</span></div>}
              {Number(form.propina) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#22c55e' }}><span>Propina</span><span>+${Number(form.propina).toLocaleString()}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #2a2a2a', fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800, color: '#f97316' }}><span>TOTAL</span><span>${totalFinal.toLocaleString()}</span></div>
              {form.montoPagado && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14, color: '#22c55e', fontWeight: 700 }}><span>💵 Cambio</span><span>${cambio.toLocaleString()}</span></div>}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit">Emitir Factura</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
