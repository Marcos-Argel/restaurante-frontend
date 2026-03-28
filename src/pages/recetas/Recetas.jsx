import { useEffect, useState } from 'react'
import { getProductos, getInventario } from '../../services/api'
import { PageHeader, Modal, Select, Btn, Card, Table, Tr, Td } from '../../components/ui'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function Recetas() {
  const [productos, setProductos] = useState([])
  const [inventario, setInventario] = useState([])
  const [productoSel, setProductoSel] = useState(null)
  const [receta, setReceta] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ inventarioId: '', cantidadUsada: '', notas: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getProductos().then(r => setProductos((r.data.data || []).filter(p => p.esPreparado && p.estado !== 'INACTIVO')))
    getInventario().then(r => setInventario(r.data.data || []))
  }, [])

  const cargarReceta = async (producto) => {
    setProductoSel(producto)
    setLoading(true)
    try {
      const r = await api.get(`/recetas/producto/${producto.id}`)
      setReceta(r.data.data || [])
    } catch { toast.error('Error al cargar receta') }
    finally { setLoading(false) }
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.inventarioId) return toast.error('Selecciona un ingrediente')
    if (!form.cantidadUsada || Number(form.cantidadUsada) <= 0) return toast.error('La cantidad debe ser mayor a 0')
    try {
      await api.post('/recetas', {
        productoId: productoSel.id,
        inventarioId: Number(form.inventarioId),
        cantidadUsada: Number(form.cantidadUsada),
        notas: form.notas || null
      })
      toast.success('Ingrediente agregado')
      setModal(false)
      setForm({ inventarioId: '', cantidadUsada: '', notas: '' })
      cargarReceta(productoSel)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al agregar ingrediente')
    }
  }

  const eliminarIngrediente = async (id) => {
    if (!window.confirm('¿Quitar este ingrediente de la receta?')) return
    try {
      await api.delete(`/recetas/${id}`)
      toast.success('Ingrediente eliminado')
      cargarReceta(productoSel)
    } catch { toast.error('Error al eliminar') }
  }

  const ingredientesDisponibles = inventario.filter(
    ing => !receta.find(r => r.inventario?.id === ing.id)
  )

  return (
    <div className="fade-in">
      <PageHeader
        title="Recetas"
        sub="Configura los ingredientes de cada producto"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>

        {/* Lista de productos */}
        <div>
          <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Productos preparados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {productos.map(p => (
              <div key={p.id} onClick={() => cargarReceta(p)} style={{
                background: productoSel?.id === p.id ? '#f9731622' : '#111',
                border: `1px solid ${productoSel?.id === p.id ? '#f97316' : '#1e1e1e'}`,
                borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', transition: 'all .15s'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>{p.nombre}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#666' }}>{p.categoria?.nombre}</span>
                  <span style={{ fontSize: '11px', color: productoSel?.id === p.id ? '#f97316' : '#444' }}>
                    {productoSel?.id === p.id && receta.length > 0 ? `${receta.length} ingrediente${receta.length > 1 ? 's' : ''}` : ''}
                  </span>
                </div>
              </div>
            ))}
            {productos.length === 0 && (
              <div style={{ color: '#555', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                No hay productos preparados
              </div>
            )}
          </div>
        </div>

        {/* Panel de receta */}
        <div>
          {!productoSel ? (
            <Card>
              <div style={{ padding: '60px', textAlign: 'center', color: '#555' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>👈</div>
                <div style={{ fontSize: '14px' }}>Selecciona un producto para ver o editar su receta</div>
              </div>
            </Card>
          ) : (
            <Card>
              {/* Header del producto */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 800, color: '#f0f0f0' }}>
                    {productoSel.nombre}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {productoSel.categoria?.nombre} — ${Number(productoSel.precio).toLocaleString()}
                  </div>
                </div>
                <Btn onClick={() => setModal(true)}>+ Agregar ingrediente</Btn>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Cargando receta...</div>
              ) : receta.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#555' }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>🧪</div>
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>Este producto no tiene ingredientes configurados</div>
                  <div style={{ fontSize: '12px', color: '#444' }}>Agrega ingredientes para que el stock baje automáticamente al preparar pedidos</div>
                </div>
              ) : (
                <Table headers={['Ingrediente', 'Cantidad', 'Unidad', 'Stock actual', 'Notas', 'Acciones']}>
                  {receta.map(item => (
                    <Tr key={item.id}>
                      <Td><span style={{ fontWeight: 600, color: '#f0f0f0' }}>{item.inventario?.nombreIngrediente}</span></Td>
                      <Td><span style={{ color: '#f97316', fontWeight: 600 }}>{Number(item.cantidadUsada).toLocaleString()}</span></Td>
                      <Td><span style={{ fontSize: '12px', color: '#888' }}>{item.inventario?.unidadMedida}</span></Td>
                      <Td>
                        <span style={{
                          color: item.inventario?.stockActual <= item.inventario?.stockMinimo ? '#ef4444' :
                            item.inventario?.stockActual <= item.inventario?.stockAlerta ? '#f59e0b' : '#22c55e',
                          fontWeight: 600, fontSize: '13px'
                        }}>
                          {Number(item.inventario?.stockActual || 0).toLocaleString()} {item.inventario?.unidadMedida}
                        </span>
                      </Td>
                      <Td><span style={{ fontSize: '12px', color: '#666' }}>{item.notas || '—'}</span></Td>
                      <Td>
                        <button onClick={() => eliminarIngrediente(item.id)} style={{
                          background: '#450a0a22', border: '1px solid #7f1d1d', borderRadius: '6px',
                          padding: '4px 10px', color: '#fca5a5', fontSize: '11px', cursor: 'pointer', fontWeight: 600
                        }}>🗑 Quitar</button>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              )}

              {/* Info */}
              {receta.length > 0 && (
                <div style={{ marginTop: '16px', background: '#1e3a5f22', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px 16px', fontSize: '12px', color: '#93c5fd' }}>
                  ℹ️ Cuando un pedido con <strong>{productoSel.nombre}</strong> pase a <strong> PREPARACIÓN</strong>, el sistema descontará automáticamente estos ingredientes del inventario.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Modal agregar ingrediente */}
      {modal && (
        <Modal title={`Agregar ingrediente — ${productoSel?.nombre}`} onClose={() => { setModal(false); setForm({ inventarioId: '', cantidadUsada: '', notas: '' }) }} width="500px">
          <form onSubmit={guardar}>
            <Select label="Ingrediente" required value={form.inventarioId} onChange={e => setForm({ ...form, inventarioId: e.target.value })}>
              <option value="">Seleccionar ingrediente</option>
              {ingredientesDisponibles.map(ing => (
                <option key={ing.id} value={ing.id}>
                  {ing.nombreIngrediente} — Stock: {Number(ing.stockActual).toLocaleString()} {ing.unidadMedida}
                </option>
              ))}
            </Select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: 500 }}>
                  Cantidad usada por porción
                </label>
                <input
                  type="number" min="0.01" step="0.01" required
                  value={form.cantidadUsada}
                  onChange={e => setForm({ ...form, cantidadUsada: e.target.value })}
                  placeholder="Ej: 200"
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 13px', color: '#f0f0f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
                {form.inventarioId && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Unidad: {inventario.find(i => i.id == form.inventarioId)?.unidadMedida}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: 500 }}>
                  Notas (opcional)
                </label>
                <input
                  type="text"
                  value={form.notas}
                  onChange={e => setForm({ ...form, notas: e.target.value })}
                  placeholder="Ej: picado fino"
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 13px', color: '#f0f0f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Btn variant="secondary" type="button" onClick={() => { setModal(false); setForm({ inventarioId: '', cantidadUsada: '', notas: '' }) }}>Cancelar</Btn>
              <Btn type="submit">Agregar</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
