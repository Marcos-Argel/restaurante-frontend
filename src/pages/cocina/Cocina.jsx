import { useEffect, useState } from 'react'
import { getPedidosCocina, cambiarEstadoPedido } from '../../services/api'
import { Badge, Btn } from '../../components/ui'
import toast from 'react-hot-toast'

export default function Cocina() {
  const [pedidos, setPedidos] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const cargar = () => {
    getPedidosCocina().then(r => {
      setPedidos(r.data.data || [])
      setLastUpdate(new Date())
    }).catch(() => {})
  }

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 15000) // Auto-refresh cada 15s
    return () => clearInterval(interval)
  }, [])

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoPedido(id, estado)
      toast.success(estado === 'EN_PREPARACION' ? '👨‍🍳 Pedido en preparación' : '✅ Pedido listo!')
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE')
  const enPreparacion = pedidos.filter(p => p.estado === 'EN_PREPARACION')

  const tiempoTranscurrido = (fechaStr) => {
    const diff = Math.floor((new Date() - new Date(fechaStr)) / 60000)
    if (diff < 1) return 'Ahora'
    if (diff === 1) return '1 min'
    return `${diff} min`
  }

  const colorTiempo = (fechaStr) => {
    const diff = Math.floor((new Date() - new Date(fechaStr)) / 60000)
    if (diff < 10) return '#22c55e'
    if (diff < 20) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="fade-in" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      {/* Header cocina */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: '800', color: '#f0f0f0' }}>
            👨‍🍳 Vista de Cocina
          </h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
            Actualizado: {lastUpdate.toLocaleTimeString()} · Auto-refresh cada 15s
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ background: '#422006', color: '#fbbf24', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              ⏳ {pendientes.length} pendientes
            </span>
            <span style={{ background: '#1e3a5f', color: '#60a5fa', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              🔥 {enPreparacion.length} en preparación
            </span>
          </div>
          <button onClick={cargar} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '8px 14px', color: '#888', cursor: 'pointer', fontSize: '13px' }}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: '700', color: '#444' }}>Todo al día</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>No hay pedidos pendientes</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {pedidos.map(pedido => (
            <div key={pedido.id} style={{
              background: '#111',
              border: `2px solid ${pedido.estado === 'PENDIENTE' ? '#f59e0b44' : '#3b82f644'}`,
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'border-color .2s'
            }}>
              {/* Card header */}
              <div style={{
                background: pedido.estado === 'PENDIENTE' ? '#42200622' : '#1e3a5f22',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #1e1e1e'
              }}>
                <div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: '800', color: '#f0f0f0' }}>
                    {pedido.mesa || pedido.tipoPedido}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{pedido.numeroPedido}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: colorTiempo(pedido.fechaCreacion) }}>
                    {tiempoTranscurrido(pedido.fechaCreacion)}
                  </div>
                  <Badge estado={pedido.estado} />
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '12px 18px' }}>
                {pedido.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #161616' }}>
                    <div>
                      <div style={{ color: '#f0f0f0', fontSize: '15px', fontWeight: '600' }}>
                        <span style={{ color: '#f97316', marginRight: '8px' }}>x{item.cantidad}</span>
                        {item.producto}
                      </div>
                      {item.notas && (
                        <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '3px', background: '#422006', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>
                          ⚠️ {item.notas}
                        </div>
                      )}
                    </div>
                    <Badge estado={item.estado} />
                  </div>
                ))}

                {pedido.notasEspeciales && (
                  <div style={{ marginTop: '10px', background: '#1a0800', border: '1px solid #7c2d12', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#fdba74' }}>
                    📝 {pedido.notasEspeciales}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div style={{ padding: '14px 18px', borderTop: '1px solid #1e1e1e', display: 'flex', gap: '8px' }}>
                {pedido.estado === 'PENDIENTE' && (
                  <button onClick={() => cambiarEstado(pedido.id, 'EN_PREPARACION')} style={{
                    flex: 1, background: '#1e3a5f', border: 'none', borderRadius: '10px',
                    padding: '10px', color: '#60a5fa', fontSize: '14px', fontWeight: '700',
                    cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
                  }}>
                    🔥 Iniciar preparación
                  </button>
                )}
                {pedido.estado === 'EN_PREPARACION' && (
                  <button onClick={() => cambiarEstado(pedido.id, 'LISTO')} style={{
                    flex: 1, background: '#14532d', border: 'none', borderRadius: '10px',
                    padding: '10px', color: '#86efac', fontSize: '14px', fontWeight: '700',
                    cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
                  }}>
                    ✅ Marcar como listo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
