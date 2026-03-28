import { useEffect, useState } from 'react'
import { getInventario, crearIngrediente, actualizarIngrediente, ajustarStock, getProveedores } from '../../services/api'
import { PageHeader, Modal, Input, Select, Btn, Card, Table, Tr, Td } from '../../components/ui'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function Inventario() {
  const [inventario, setInventario] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [modal, setModal] = useState(false)
  const [modalAjuste, setModalAjuste] = useState(null)
  const [editando, setEditando] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [soloAlerta, setSoloAlerta] = useState(false)
  const [form, setForm] = useState({ nombreIngrediente: '', unidadMedida: 'KG', stockActual: '', stockMinimo: '', stockAlerta: '', costoUnitario: '', ubicacion: '', proveedorId: '' })
  const [ajuste, setAjuste] = useState({ cantidad: '', tipo: 'ENTRADA', motivo: '' })

  const eliminarIngrediente = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/inventario/${id}`)
      toast.success('Ingrediente eliminado')
      cargar()
    } catch (err) { toast.error(err.response?.data?.message || 'No se puede eliminar') }
  }

  const cargar = () => {
    getInventario().then(r => setInventario(r.data.data || []))
    getProveedores().then(r => setProveedores(r.data.data || []))
  }

  useEffect(() => { cargar() }, [])

  const abrirModal = (i = null) => {
    if (i) {
      setForm({ nombreIngrediente: i.nombreIngrediente, unidadMedida: i.unidadMedida, stockActual: i.stockActual, stockMinimo: i.stockMinimo, stockAlerta: i.stockAlerta, costoUnitario: i.costoUnitario, ubicacion: i.ubicacion || '', proveedorId: i.proveedor?.id || '' })
      setEditando(i)
    } else {
      setForm({ nombreIngrediente: '', unidadMedida: 'KG', stockActual: '', stockMinimo: '', stockAlerta: '', costoUnitario: '', ubicacion: '', proveedorId: '' })
      setEditando(null)
    }
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (Number(form.stockActual) < 0) return toast.error('El stock actual no puede ser negativo')
    if (Number(form.stockMinimo) < 0) return toast.error('El stock mínimo no puede ser negativo')
    if (Number(form.stockAlerta) < 0) return toast.error('El stock alerta no puede ser negativo')
    if (Number(form.costoUnitario) < 0) return toast.error('El costo unitario no puede ser negativo')
    try {
      const payload = {
        nombreIngrediente: form.nombreIngrediente,
        unidadMedida: form.unidadMedida,
        stockActual: Number(form.stockActual) || 0,
        stockMinimo: Number(form.stockMinimo) || 0,
        stockAlerta: Number(form.stockAlerta) || 0,
        costoUnitario: Number(form.costoUnitario) || 0,
        ubicacion: form.ubicacion || null,
        proveedorId: form.proveedorId ? Number(form.proveedorId) : null
      }
      if (editando) {
        await actualizarIngrediente(editando.id, payload)
        toast.success('Ingrediente actualizado')
      } else {
        await crearIngrediente(payload)
        toast.success('Ingrediente creado')
      }
      setModal(false)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const hacerAjuste = async (e) => {
    e.preventDefault()
    try {
      await ajustarStock(modalAjuste.id, ajuste)
      toast.success('Stock ajustado')
      setModalAjuste(null)
      setAjuste({ cantidad: '', tipo: 'ENTRADA', motivo: '' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const estadoStock = (i) => {
    if (i.stockActual <= i.stockMinimo) return { color: '#ef4444', label: 'CRÍTICO', bg: '#450a0a' }
    if (i.stockActual <= i.stockAlerta) return { color: '#f59e0b', label: 'BAJO', bg: '#422006' }
    return { color: '#22c55e', label: 'OK', bg: '#14532d' }
  }

  const lista = inventario
    .filter(i => !soloAlerta || i.stockActual <= i.stockAlerta)
    .filter(i => i.nombreIngrediente.toLowerCase().includes(filtro.toLowerCase()))

  const criticos = inventario.filter(i => i.stockActual <= i.stockMinimo).length
  const bajos = inventario.filter(i => i.stockActual > i.stockMinimo && i.stockActual <= i.stockAlerta).length

  return (
    <div className="fade-in">
      <PageHeader
        title="Inventario"
        sub={`${inventario.length} ingredientes · ${criticos} críticos · ${bajos} bajos`}
        action={<Btn onClick={() => abrirModal()}>+ Nuevo Ingrediente</Btn>}
      />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          placeholder="🔍 Buscar ingrediente..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 16px', color: '#f0f0f0', fontSize: '14px', outline: 'none', width: '280px' }}
        />
        <button onClick={() => setSoloAlerta(!soloAlerta)} style={{
          background: soloAlerta ? '#42200633' : '#111', border: `1px solid ${soloAlerta ? '#f59e0b' : '#2a2a2a'}`,
          borderRadius: '10px', padding: '10px 16px', color: soloAlerta ? '#f59e0b' : '#666', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
        }}>
          ⚠️ Solo alertas ({criticos + bajos})
        </button>
      </div>

      <Card>
        <Table headers={['Ingrediente', 'Stock actual', 'Mínimo', 'Alerta', 'Unidad', 'Costo unit.', 'Estado', 'Acciones']}>
          {lista.map(i => {
            const s = estadoStock(i)
            return (
              <Tr key={i.id}>
                <Td>
                  <div style={{ fontWeight: '600', color: '#f0f0f0' }}>{i.nombreIngrediente}</div>
                  {i.ubicacion && <div style={{ color: '#666', fontSize: '12px' }}>📍 {i.ubicacion}</div>}
                </Td>
                <Td>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: '800', color: s.color }}>
                    {i.stockActual}
                  </span>
                </Td>
                <Td><span style={{ color: '#888' }}>{i.stockMinimo}</span></Td>
                <Td><span style={{ color: '#888' }}>{i.stockAlerta}</span></Td>
                <Td><span style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', color: '#ccc' }}>{i.unidadMedida}</span></Td>
                <Td><span style={{ color: '#f97316' }}>${Number(i.costoUnitario || 0).toLocaleString()}</span></Td>
                <Td><span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{s.label}</span></Td>
                <Td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { setModalAjuste(i); setAjuste({ cantidad: '', tipo: 'ENTRADA', motivo: '' }) }} style={{ background: '#1e3a5f', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#93c5fd', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Ajustar
                    </button>
                    <button onClick={() => abrirModal(i)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '4px 10px', color: '#888', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Editar
                    </button>
                    <button onClick={() => eliminarIngrediente(i.id, i.nombreIngrediente)} style={{ background: '#450a0a22', border: '1px solid #7f1d1d', borderRadius: '6px', padding: '4px 10px', color: '#fca5a5', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      🗑
                    </button>
                  </div>
                </Td>
              </Tr>
            )
          })}
          {lista.length === 0 && (
            <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#555' }}>No hay ingredientes</td></tr>
          )}
        </Table>
      </Card>

      {/* Modal ajuste stock */}
      {modalAjuste && (
        <Modal title={`Ajustar Stock — ${modalAjuste.nombreIngrediente}`} onClose={() => setModalAjuste(null)}>
          <div style={{ background: '#1a1a1a', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888', fontSize: '13px' }}>Stock actual:</span>
            <span style={{ color: '#f0f0f0', fontWeight: '700', fontSize: '16px' }}>{modalAjuste.stockActual} {modalAjuste.unidadMedida}</span>
          </div>
          <form onSubmit={hacerAjuste}>
            <Select label="Tipo de movimiento" value={ajuste.tipo} onChange={e => setAjuste({ ...ajuste, tipo: e.target.value })}>
              <option value="ENTRADA">📥 Entrada (agregar)</option>
              <option value="SALIDA">📤 Salida (descontar)</option>
              <option value="AJUSTE">🔄 Ajuste (establecer cantidad)</option>
              <option value="MERMA">🗑️ Merma (pérdida)</option>
            </Select>
            <Input label="Cantidad" type="number" step="0.01" required value={ajuste.cantidad} onChange={e => setAjuste({ ...ajuste, cantidad: e.target.value })} placeholder="0.00" />
            <Input label="Motivo" required value={ajuste.motivo} onChange={e => setAjuste({ ...ajuste, motivo: e.target.value })} placeholder="Ej: Compra semanal, merma por vencimiento..." />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Btn variant="secondary" type="button" onClick={() => setModalAjuste(null)}>Cancelar</Btn>
              <Btn type="submit">Aplicar Ajuste</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal crear/editar ingrediente */}
      {modal && (
        <Modal title={editando ? 'Editar Ingrediente' : 'Nuevo Ingrediente'} onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <Input label="Nombre del ingrediente" required value={form.nombreIngrediente} onChange={e => setForm({ ...form, nombreIngrediente: e.target.value })} placeholder="Ej: Harina de trigo" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select label="Unidad de medida" value={form.unidadMedida} onChange={e => setForm({ ...form, unidadMedida: e.target.value })}>
                {['KG', 'G', 'L', 'ML', 'UNIDAD', 'PORCION'].map(u => <option key={u}>{u}</option>)}
              </Select>
              <Input label="Stock actual" type="number" step="0.01" min="0" required value={form.stockActual} onChange={e => setForm({ ...form, stockActual: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Input label="Stock mínimo" type="number" step="0.01" min="0" value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: e.target.value })} />
              <Input label="Stock alerta" type="number" step="0.01" min="0" value={form.stockAlerta} onChange={e => setForm({ ...form, stockAlerta: e.target.value })} />
              <Input label="Costo unitario" type="number" step="0.01" min="0" value={form.costoUnitario} onChange={e => setForm({ ...form, costoUnitario: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Ubicación" value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} placeholder="Refrigerador, Almacén..." />
              <Select label="Proveedor" value={form.proveedorId} onChange={e => setForm({ ...form, proveedorId: e.target.value })}>
                <option value="">Sin proveedor</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Btn variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit">{editando ? 'Actualizar' : 'Crear'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
