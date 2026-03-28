import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Mesas from './pages/mesas/Mesas'
import Pedidos from './pages/pedidos/Pedidos'
import Cocina from './pages/cocina/Cocina'
import Productos from './pages/productos/Productos'
import Inventario from './pages/inventario/Inventario'
import Facturas from './pages/facturas/Facturas'
import Usuarios from './pages/usuarios/Usuarios'
import Reservas from './pages/reservas/Reservas'
import Reportes from './pages/reportes/Reportes'
import Recetas from './pages/recetas/Recetas'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #1e1e1e', borderTop: '3px solid #f97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#555', fontSize: '14px' }}>Cargando...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a1a', color: '#f0f0f0', border: '1px solid #2a2a2a', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0a0a0a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0a' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/mesas" element={<PrivateRoute roles={['ADMIN','GERENTE','MESERO','BARTENDER']}><Mesas /></PrivateRoute>} />
          <Route path="/pedidos" element={<PrivateRoute roles={['ADMIN','GERENTE','MESERO','CAJERO','BARTENDER']}><Pedidos /></PrivateRoute>} />
          <Route path="/cocina" element={<PrivateRoute roles={['ADMIN','GERENTE','COCINERO']}><Cocina /></PrivateRoute>} />
          <Route path="/productos" element={<PrivateRoute roles={['ADMIN','GERENTE']}><Productos /></PrivateRoute>} />
          <Route path="/inventario" element={<PrivateRoute roles={['ADMIN','GERENTE']}><Inventario /></PrivateRoute>} />
          <Route path="/facturas" element={<PrivateRoute roles={['ADMIN','GERENTE','CAJERO']}><Facturas /></PrivateRoute>} />
          <Route path="/reservas" element={<PrivateRoute roles={['ADMIN','GERENTE','MESERO','CAJERO']}><Reservas /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute roles={['ADMIN','GERENTE']}><Usuarios /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute roles={['ADMIN','GERENTE']}><Reportes /></PrivateRoute>} />
          <Route path="/recetas" element={<PrivateRoute roles={['ADMIN','GERENTE']}><Recetas /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
