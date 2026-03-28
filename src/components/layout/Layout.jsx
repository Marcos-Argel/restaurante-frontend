import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const nav = [
  { path: '/',           icon: '📊', label: 'Dashboard',  roles: ['ADMIN','GERENTE','MESERO','CAJERO','COCINERO','BARTENDER'] },
  { path: '/mesas',      icon: '🪑', label: 'Mesas',      roles: ['ADMIN','GERENTE','MESERO','BARTENDER'] },
  { path: '/pedidos',    icon: '📋', label: 'Pedidos',    roles: ['ADMIN','GERENTE','MESERO','CAJERO','BARTENDER'] },
  { path: '/cocina',     icon: '👨‍🍳', label: 'Cocina',    roles: ['ADMIN','GERENTE','COCINERO'] },
  { path: '/productos',  icon: '🍕', label: 'Productos',  roles: ['ADMIN','GERENTE'] },
  { path: '/inventario', icon: '📦', label: 'Inventario', roles: ['ADMIN','GERENTE'] },
  { path: '/facturas',   icon: '🧾', label: 'Facturas',   roles: ['ADMIN','GERENTE','CAJERO'] },
  { path: '/reservas',   icon: '📅', label: 'Reservas',   roles: ['ADMIN','GERENTE','MESERO'] },
  { path: '/usuarios',   icon: '👥', label: 'Usuarios',   roles: ['ADMIN','GERENTE'] },
  { path: '/recetas',    icon: '🧪', label: 'Recetas',    roles: ['ADMIN','GERENTE'] },
  { path: '/reportes',   icon: '📈', label: 'Reportes',   roles: ['ADMIN','GERENTE'] },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const visibleNav = nav.filter(n => n.roles.includes(user?.rol))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <style>{`
        .nav-link { display: flex; align-items: center; gap: 10px; border-radius: 10px; text-decoration: none; font-size: 14px; transition: all .15s; }
        .nav-link:hover { background: #1a0000 !important; color: #ff6666 !important; }
        .nav-link.active { background: #2a0000 !important; color: #ff4444 !important; font-weight: 600; }
        .logout-btn:hover { border-color: #c00000 !important; color: #ff6666 !important; }
        .toggle-btn:hover { background: #2a2a2a !important; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '64px' : '220px',
        background: '#111',
        borderRight: '1px solid #1e0000',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .25s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 0' : '16px', borderBottom: '1px solid #1e0000', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #c00000, #e00000)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0, marginLeft: collapsed ? '14px' : '0',
            boxShadow: '0 0 10px rgba(200,0,0,0.3)'
          }}>🐔</div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '800', fontSize: '13px', color: '#f0f0f0', whiteSpace: 'nowrap', lineHeight: 1.2 }}>Fast & Healthy</div>
              <div style={{ fontSize: '10px', color: '#c00000', fontWeight: 600 }}>🥗 Sistema</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {visibleNav.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${active ? 'active' : ''}`}
                style={{
                  padding: collapsed ? '10px 0' : '9px 12px',
                  color: active ? '#ff4444' : '#888',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1e0000' }}>
          {!collapsed && (
            <div style={{ padding: '10px 12px', marginBottom: '6px', background: '#1a0000', borderRadius: '10px', border: '1px solid #2a0000' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nombre}</div>
              <div style={{ fontSize: '11px', color: '#ff4444', marginTop: '2px' }}>{user?.rol}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{
              width: '100%', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '10px',
              padding: collapsed ? '10px 0' : '9px 12px', color: '#888', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '8px',
              transition: 'all .15s'
            }}
          >
            <span>🚪</span>{!collapsed && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Toggle btn */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="toggle-btn"
        style={{
          position: 'fixed', left: collapsed ? '44px' : '200px', top: '50%', transform: 'translateY(-50%)',
          background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '50%', width: '24px', height: '24px',
          cursor: 'pointer', color: '#888', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, transition: 'left .25s ease'
        }}
      >
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '28px', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
