import { useEffect, useState } from 'react'
import {
  getProductos, crearProducto, actualizarProducto, cambiarEstadoProducto, eliminarProducto,
  getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria
} from '../../services/api'
import { PageHeader, Modal, Input, Select, Btn, Badge, Card, Table, Tr, Td } from '../../components/ui'
import toast from 'react-hot-toast'
import api from '../../services/api'

const CLOUDINARY_CLOUD = 'dyjqz2q6w'
const CLOUDINARY_PRESET = 'restaurante_productos'

async function subirImagenCloudinary(archivo) {
  const formData = new FormData()
  formData.append('file', archivo)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  formData.append('folder', 'restaurante/productos')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: formData
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error('Error al subir imagen')
  return data.secure_url
}

// ── Vista MENÚ tipo carta ─────────────────────────────────
function VistaMenu({ productos, categorias }) {
  const activos = productos.filter(p => p.estado === 'ACTIVO')
  const fmt = (p) => `$${Number(p).toLocaleString('es-CO')}`

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', padding: '32px 20px 24px', borderBottom: '2px solid #f97316' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🍽️</div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-1px' }}>
          NUESTRA CARTA
        </h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>{activos.length} productos disponibles</p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
        {categorias.map(cat => {
          const prodsCat = activos.filter(p => p.categoria?.id === cat.id || p.categoria?.nombre === cat.nombre)
          if (!prodsCat.length) return null
          return (
            <div key={cat.id} style={{ marginBottom: 44 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right, transparent, #f97316)' }} />
                <div style={{ background: '#f97316', color: '#fff', padding: '8px 24px', borderRadius: 24, fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '.12em', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 20px #f9731644' }}>
                  {cat.icono && <span>{cat.icono}</span>}{cat.nombre}
                </div>
                <div style={{ flex: 1, height: 2, background: 'linear-gradient(to left, transparent, #f97316)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {prodsCat.map(p => <ProductoCard key={p.id} p={p} fmt={fmt} />)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProductoCard({ p, fmt }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
      {/* Imagen */}
      {p.imagenUrl ? (
        <img src={p.imagenUrl} alt={p.nombre} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 160, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🍽️</div>
      )}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#f0f0f0', marginBottom: 4 }}>{p.nombre}</div>
            {p.descripcion && <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{p.descripcion}</div>}
            {p.tiempoPreparacion && <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>⏱️ {p.tiempoPreparacion} min</div>}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, color: '#f97316' }}>{fmt(p.precio)}</div>
            {p.estado === 'AGOTADO' && <div style={{ fontSize: 10, color: '#fca5a5', background: '#450a0a', padding: '2px 8px', borderRadius: 8, marginTop: 4 }}>AGOTADO</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Gestión de categorías ─────────────────────────────────
function CategoriasPanel({ categorias, onRefresh }) {
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', icono: '' })

  const abrirModal = (c = null) => {
    if (c) { setForm({ nombre: c.nombre, descripcion: c.descripcion || '', icono: c.icono || '' }); setEditando(c) }
    else { setForm({ nombre: '', descripcion: '', icono: '' }); setEditando(null) }
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      if (editando) { await actualizarCategoria(editando.id, form); toast.success('Categoría actualizada') }
      else { await crearCategoria(form); toast.success('Categoría creada') }
      setModal(false); onRefresh()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return
    try { await eliminarCategoria(id); toast.success('Categoría eliminada'); onRefresh() }
    catch (err) { toast.error(err.response?.data?.message || 'No se puede eliminar — tiene productos asociados') }
  }

  const iconos = ['🍕','🍔','🍗','🥩','🐟','🥗','🍜','🍲','🥘','🍱','🧆','🥞','🍰','🍦','🥤','🍺','🧃','☕','🍷','🎂','🫖','🥛','💧','🧊']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#f0f0f0' }}>Categorías del menú</h3>
        <Btn onClick={() => abrirModal()} small>+ Nueva Categoría</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {categorias.map(c => (
          <div key={c.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{c.icono || '🏷️'}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>{c.nombre}</div>
                {c.descripcion && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{c.descripcion.substring(0, 25)}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => abrirModal(c)} style={{ background: '#1e3a5f', border: 'none', borderRadius: 6, padding: '3px 8px', color: '#93c5fd', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Editar</button>
              <button onClick={() => eliminar(c.id, c.nombre)} style={{ background: '#450a0a', border: 'none', borderRadius: 6, padding: '3px 8px', color: '#fca5a5', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Borrar</button>
            </div>
          </div>
        ))}
        {categorias.length === 0 && <div style={{ gridColumn: '1/-1', padding: 24, textAlign: 'center', color: '#555', fontSize: 14 }}>No hay categorías. Crea la primera.</div>}
      </div>

      {modal && (
        <Modal title={editando ? 'Editar Categoría' : 'Nueva Categoría'} onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <Input label="Nombre de la categoría" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Jugos Naturales" />
            <Input label="Descripción (opcional)" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 8, fontWeight: 500 }}>Icono</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {iconos.map(ic => (
                  <button key={ic} type="button" onClick={() => setForm({ ...form, icono: ic })} style={{ fontSize: 20, background: form.icono === ic ? '#f9731622' : '#1a1a1a', border: `1px solid ${form.icono === ic ? '#f97316' : '#2a2a2a'}`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit">{editando ? 'Actualizar' : 'Crear'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────
export default function Productos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [vista, setVista] = useState('lista')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', categoriaId: '',
    tiempoPreparacion: '', esPreparado: true, subcategoria: '', imagenUrl: ''
  })

  const cargar = () => {
    getProductos().then(r => setProductos(r.data.data || []))
    getCategorias().then(r => setCategorias(r.data.data || []))
  }

  useEffect(() => { cargar() }, [])

  const abrirModal = (p = null) => {
    if (p) {
      setForm({
        nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio,
        categoriaId: p.categoria?.id || '', tiempoPreparacion: p.tiempoPreparacion || '',
        esPreparado: p.esPreparado, subcategoria: p.subcategoria || '', imagenUrl: p.imagenUrl || ''
      })
      setEditando(p)
    } else {
      setForm({ nombre: '', descripcion: '', precio: '', categoriaId: '', tiempoPreparacion: '', esPreparado: true, subcategoria: '', imagenUrl: '' })
      setEditando(null)
    }
    setModal(true)
  }

  const handleImagen = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    if (archivo.size > 5 * 1024 * 1024) return toast.error('La imagen no puede superar 5MB')
    setSubiendoImagen(true)
    try {
      const url = await subirImagenCloudinary(archivo)
      setForm(f => ({ ...f, imagenUrl: url }))
      toast.success('Imagen subida correctamente')
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setSubiendoImagen(false)
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (/^[0-9]+$/.test(form.nombre?.trim())) return toast.error('El nombre no puede ser solo números')
    if (Number(form.precio) < 0) return toast.error('El precio no puede ser negativo')
    try {
      if (editando) { await actualizarProducto(editando.id, form); toast.success('Producto actualizado') }
      else { await crearProducto(form); toast.success('Producto creado') }
      setModal(false); cargar()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const cambiarEstado = async (id, estado) => {
    try { await cambiarEstadoProducto(id, estado); toast.success('Estado actualizado'); cargar() }
    catch { toast.error('Error al cambiar estado') }
  }

  const eliminarProd = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el producto "${nombre}"?`)) return
    try { await eliminarProducto(id); toast.success('Producto eliminado'); cargar() }
    catch (err) { toast.error(err.response?.data?.message || 'No se puede eliminar el producto') }
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.categoria?.nombre || '').toLowerCase().includes(filtro.toLowerCase())
  )

  const btnVista = (v, label, icon) => (
    <button onClick={() => setVista(v)} style={{
      background: vista === v ? '#f97316' : '#1a1a1a',
      border: `1px solid ${vista === v ? '#f97316' : '#2a2a2a'}`,
      borderRadius: 10, padding: '8px 16px', color: vista === v ? '#fff' : '#888',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
    }}>
      <span>{icon}</span>{label}
    </button>
  )

  return (
    <div className="fade-in">
      <PageHeader
        title="Productos y Menú"
        sub={`${productos.length} productos · ${categorias.length} categorías`}
        action={vista === 'lista' ? <Btn onClick={() => abrirModal()}>+ Nuevo Producto</Btn> : null}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {btnVista('lista', 'Lista', '📋')}
        {btnVista('menu', 'Ver Menú', '🍽️')}
        {btnVista('categorias', 'Categorías', '🏷️')}
      </div>

      {vista === 'menu' && (
        <div style={{ background: '#111', borderRadius: 16, overflow: 'hidden', border: '1px solid #1e1e1e' }}>
          <div style={{ padding: '14px 20px', background: '#161616', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#888', fontSize: 13 }}>Vista carta — tal como la verá el cliente</span>
            <span style={{ background: '#22c55e22', color: '#86efac', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {productos.filter(p => p.estado === 'ACTIVO').length} disponibles
            </span>
          </div>
          <VistaMenu productos={productos} categorias={categorias} />
        </div>
      )}

      {vista === 'categorias' && (
        <Card style={{ padding: 24 }}>
          <CategoriasPanel categorias={categorias} onRefresh={cargar} />
        </Card>
      )}

      {vista === 'lista' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <input placeholder="🔍 Buscar producto o categoría..." value={filtro} onChange={e => setFiltro(e.target.value)}
              style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 16px', color: '#f0f0f0', fontSize: 14, outline: 'none', width: 360 }} />
          </div>
          <Card>
            <Table headers={['', 'Producto', 'Categoría', 'Precio', 'Estado', 'Acciones']}>
              {productosFiltrados.map(p => (
                <Tr key={p.id}>
                  <Td>
                    {p.imagenUrl
                      ? <img src={p.imagenUrl} alt={p.nombre} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #2a2a2a' }} />
                      : <div style={{ width: 48, height: 48, borderRadius: 8, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid #2a2a2a' }}>🍽️</div>
                    }
                  </Td>
                  <Td>
                    <div style={{ fontWeight: 600, color: '#f0f0f0' }}>{p.nombre}</div>
                    {p.descripcion && <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{p.descripcion.substring(0, 45)}{p.descripcion.length > 45 ? '...' : ''}</div>}
                  </Td>
                  <Td>
                    {p.categoria
                      ? <span style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: '#ccc' }}>
                          {categorias.find(c => c.id === p.categoria?.id)?.icono || '🏷️'} {p.categoria?.nombre}
                        </span>
                      : <span style={{ color: '#555', fontSize: 12 }}>Sin categoría</span>}
                  </Td>
                  <Td><span style={{ color: '#f97316', fontWeight: 700, fontSize: 15 }}>${Number(p.precio).toLocaleString()}</span></Td>
                  <Td><Badge estado={p.estado} /></Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => abrirModal(p)} style={{ background: '#1e3a5f', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#93c5fd', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Editar</button>
                      {p.estado === 'ACTIVO' && <button onClick={() => cambiarEstado(p.id, 'INACTIVO')} style={{ background: '#1c1917', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#a8a29e', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Desactivar</button>}
                      {p.estado === 'INACTIVO' && <button onClick={() => cambiarEstado(p.id, 'ACTIVO')} style={{ background: '#14532d', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#86efac', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Activar</button>}
                      {p.estado !== 'AGOTADO' && <button onClick={() => cambiarEstado(p.id, 'AGOTADO')} style={{ background: '#450a0a', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#fca5a5', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Agotar</button>}
                      <button onClick={() => eliminarProd(p.id, p.nombre)} style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 6, padding: '4px 10px', color: '#fca5a5', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>🗑</button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {productosFiltrados.length === 0 && (
                <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: '#555' }}>No se encontraron productos</td></tr>
              )}
            </Table>
          </Card>
        </>
      )}

      {modal && (
        <Modal title={editando ? 'Editar Producto' : 'Nuevo Producto'} onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <Input label="Nombre" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Jugo de Mora" />
            <Input label="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del producto" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Precio" type="number" step="0.01" min="0" required value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} placeholder="0.00" />
              <Input label="Tiempo prep. (min)" type="number" min="0" value={form.tiempoPreparacion} onChange={e => setForm({ ...form, tiempoPreparacion: e.target.value })} placeholder="5" />
            </div>
            <Select label="Categoría" required value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
              <option value="">Seleccionar categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.icono || '🏷️'} {c.nombre}</option>)}
            </Select>
            <Select label="Tipo" value={form.esPreparado} onChange={e => setForm({ ...form, esPreparado: e.target.value === 'true' })}>
              <option value="true">👨‍🍳 Preparado en cocina</option>
              <option value="false">📦 Producto empacado</option>
            </Select>

            {/* FOTO DEL PRODUCTO */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#aaa', marginBottom: 8, fontWeight: 500 }}>
                📸 Foto del producto
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* Preview */}
                <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: '1px solid #2a2a2a', flexShrink: 0, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {form.imagenUrl
                    ? <img src={form.imagenUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🍽️'
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', background: subiendoImagen ? '#1a1a1a' : '#1e3a5f22', border: '1px dashed #3b82f6', borderRadius: 10, padding: '10px 14px', cursor: subiendoImagen ? 'not-allowed' : 'pointer', textAlign: 'center', color: '#93c5fd', fontSize: 12, fontWeight: 600 }}>
                    {subiendoImagen ? '⏳ Subiendo...' : '📁 Seleccionar imagen'}
                    <input type="file" accept="image/*" onChange={handleImagen} disabled={subiendoImagen} style={{ display: 'none' }} />
                  </label>
                  {form.imagenUrl && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, imagenUrl: '' }))}
                      style={{ marginTop: 6, background: 'none', border: 'none', color: '#666', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
                      Quitar imagen
                    </button>
                  )}
                  <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>PNG, JPG o WebP — máx 5MB</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <Btn variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit" disabled={subiendoImagen}>{editando ? 'Actualizar' : 'Crear'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}