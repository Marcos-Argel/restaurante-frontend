import { useEffect, useState } from 'react'
import { StatCard, Card } from '../../components/ui'
import { getVentasDia, getMesas, getPedidos, getStockBajo } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [ventas, setVentas] = useState(null)
  const [mesas, setMesas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [stockBajo, setStockBajo] = useState([])

  useEffect(() => {
    getVentasDia().then(r => setVentas(r.data.data)).catch(() => {})
    getMesas().then(r => setMesas(r.data.data || [])).catch(() => {})
    getPedidos().then(r => setPedidos(r.data.data || [])).catch(() => {})
    getStockBajo().then(r => setStockBajo(r.data.data || [])).catch(() => {})
  }, [])

  const mesasLibres = mesas.filter(m => m.estado === 'LIBRE').length
  const mesasOcupadas = mesas.filter(m => m.estado === 'OCUPADA').length
  const pedidosPendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length
  const pedidosEnPrep = pedidos.filter(p => p.estado === 'EN_PREPARACION').length

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
          <span style={{ color: '#555', fontSize: '13px' }}>Sistema activo</span>
        </div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '30px', fontWeight: '800', color: '#f0f0f0' }}>
          {saludo}, {user?.nombre?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '14px' }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon="💰" label="Ventas del día" value={ventas ? `$${Number(ventas.totalVentas || 0).toLocaleString()}` : '...'} color="#22c55e" sub={`${ventas?.totalFacturas || 0} facturas`} />
        <StatCard icon="🪑" label="Mesas ocupadas" value={`${mesasOcupadas}/${mesas.length}`} color="#f97316" sub={`${mesasLibres} disponibles`} />
        <StatCard icon="📋" label="Pedidos activos" value={pedidos.length} color="#3b82f6" sub={`${pedidosPendientes} pendientes`} />
        <StatCard icon="👨‍🍳" label="En preparación" value={pedidosEnPrep} color="#a855f7" sub="en cocina ahora" />
        <StatCard icon="⚠️" label="Stock bajo" value={stockBajo.length} color="#ef4444" sub="ingredientes" />
        <StatCard icon="🎫" label="Ticket promedio" value={ventas ? `$${Number(ventas.ticketPromedio || 0).toLocaleString()}` : '...'} color="#f59e0b" sub="hoy" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pedidos recientes */}
        <Card>
          <div style={{ padding: '20px', borderBottom: '1px solid #1e1e1e' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: '700', color: '#f0f0f0' }}>Pedidos activos</h3>
          </div>
          <div style={{ padding: '8px' }}>
            {pedidos.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: '14px' }}>No hay pedidos activos</div>
            ) : pedidos.slice(0, 6).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f0f0' }}>{p.numeroPedido}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{p.mesa || p.tipoPedido}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: '#f97316', fontWeight: '600' }}>${Number(p.total || 0).toLocaleString()}</div>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: p.estado === 'PENDIENTE' ? '#422006' : p.estado === 'EN_PREPARACION' ? '#1e3a5f' : '#14532d', color: p.estado === 'PENDIENTE' ? '#fbbf24' : p.estado === 'EN_PREPARACION' ? '#60a5fa' : '#86efac' }}>
                    {p.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stock bajo */}
        <Card>
          <div style={{ padding: '20px', borderBottom: '1px solid #1e1e1e' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: '700', color: '#f0f0f0' }}>⚠️ Alertas de stock</h3>
          </div>
          <div style={{ padding: '8px' }}>
            {stockBajo.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: '14px' }}>✅ Todo el inventario OK</div>
            ) : stockBajo.slice(0, 6).map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: '500' }}>{i.nombreIngrediente}</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: i.stockActual <= i.stockMinimo ? '#fca5a5' : '#fbbf24', fontWeight: '600' }}>
                    {i.stockActual} {i.unidadMedida}
                  </span>
                  <div style={{ fontSize: '10px', color: '#555' }}>mín: {i.stockMinimo}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
