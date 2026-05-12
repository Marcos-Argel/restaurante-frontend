import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function MenuCliente() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/categorias'),
      api.get('/productos/menu')
    ]).then(([cats, prods]) => {
      const c = cats.data.data || []
      const p = prods.data.data || []
      setCategorias(c)
      setProductos(p)
      if (c.length > 0) setCategoriaActiva(c[0].id)
    }).catch(() => toast.error('Error al cargar el menú'))
    .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const productosFiltrados = categoriaActiva
    ? productos.filter(p => p.categoria?.id === categoriaActiva)
    : productos

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0' }}>
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #c00000, #e00000)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🐔</div>
          <div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '800', fontSize: '16px' }}>Fast & Healthy</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Menú del restaurante</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Hola, {user?.nombre}</span>
          <button onClick={handleLogout} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '6px 14px', color: '#aaa', fontSize: '12px', cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Filtros de categoría */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
          <button onClick={() => setCategoriaActiva(null)} style={{
            background: !categoriaActiva ? '#c00000' : '#1a1a1a',
            border: `1px solid ${!categoriaActiva ? '#c00000' : '#2a2a2a'}`,
            borderRadius: '20px', padding: '6px 16px', color: '#f0f0f0',
            fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600'
          }}>Todo</button>
          {categorias.map(c => (
            <button key={c.id} onClick={() => setCategoriaActiva(c.id)} style={{
              background: categoriaActiva === c.id ? '#c00000' : '#1a1a1a',
              border: `1px solid ${categoriaActiva === c.id ? '#c00000' : '#2a2a2a'}`,
              borderRadius: '20px', padding: '6px 16px', color: '#f0f0f0',
              fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600'
            }}>{c.icono} {c.nombre}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>Cargando menú...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {productosFiltrados.map(p => (
              <div key={p.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', overflow: 'hidden', transition: 'border-color .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#c00000'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
                {p.imagenUrl ? (
                  <img src={p.imagenUrl} alt={p.nombre} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '160px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                    🍽️
                  </div>
                )}
                <div style={{ padding: '14px' }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{p.nombre}</div>
                  {p.descripcion && <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', lineHeight: '1.4' }}>{p.descripcion}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '800', fontSize: '18px', color: '#c00000' }}>
                      ${Number(p.precio).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '11px', color: '#555', background: '#1a1a1a', padding: '3px 8px', borderRadius: '10px' }}>
                      {p.categoria?.nombre}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {productosFiltrados.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#555' }}>
                No hay productos en esta categoría
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}