import { useEffect, useState } from 'react'
import { getMesas, cambiarEstadoMesa, crearMesa, eliminarMesa } from '../../services/api'
import { PageHeader, Modal, Input, Select, Btn, Badge, Card } from '../../components/ui'
import toast from 'react-hot-toast'

const estadoColor = {
  LIBRE: '#22c55e',
  OCUPADA: '#f97316',
  RESERVADA: '#3b82f6',
  FUERA_SERVICIO: '#6b7280',
}

export default function Mesas() {
  const [mesas, setMesas] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ numero: '', capacidad: '', zona: 'Interior' })
  const [filter, setFilter] = useState('TODAS')

  const cargar = () => getMesas().then(r => setMesas(r.data.data || []))

  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    if (Number(form.numero) <= 0) return toast.error('El número de mesa debe ser mayor a 0')
    if (Number(form.capacidad) <= 0) return toast.error('La capacidad debe ser mayor a 0')
    try {
      await crearMesa(form)
      toast.success('Mesa creada')
      setModal(false)
      setForm({ numero: '', capacidad: '', zona: 'Interior' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear mesa')
    }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoMesa(id, estado)
      toast.success('Estado actualizado')
      cargar()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const eliminar = async (id, numero) => {
    if (!window.confirm(`¿Eliminar la Mesa ${numero}? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarMesa(id)
      toast.success('Mesa eliminada')
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se puede eliminar la mesa')
    }
  }

  const mesasFiltradas = filter === 'TODAS' ? mesas : mesas.filter(m => m.estado === filter)
  const stats = {
    LIBRE: mesas.filter(m => m.estado === 'LIBRE').length,
    OCUPADA: mesas.filter(m => m.estado === 'OCUPADA').length,
    RESERVADA: mesas.filter(m => m.estado === 'RESERVADA').length,
    FUERA_SERVICIO: mesas.filter(m => m.estado === 'FUERA_SERVICIO').length,
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Mapa de Mesas"
        sub={`${mesas.length} mesas en total`}
        action={<Btn onClick={() => setModal(true)}>+ Nueva Mesa</Btn>}
      />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Todas', value: 'TODAS', count: mesas.length, color: '#888' },
          { label: 'Libres', value: 'LIBRE', count: stats.LIBRE, color: '#22c55e' },
          { label: 'Ocupadas', value: 'OCUPADA', count: stats.OCUPADA, color: '#f97316' },
          { label: 'Reservadas', value: 'RESERVADA', count: stats.RESERVADA, color: '#3b82f6' },
          { label: 'Fuera servicio', value: 'FUERA_SERVICIO', count: stats.FUERA_SERVICIO, color: '#6b7280' },
        ].map(s => (
          <button key={s.value} onClick={() => setFilter(s.value)} style={{
            background: filter === s.value ? s.color + '22' : '#111',
            border: `1px solid ${filter === s.value ? s.color : '#1e1e1e'}`,
            borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
            color: filter === s.value ? s.color : '#666', fontSize: '13px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ background: s.color, width: '8px', height: '8px', borderRadius: '50%' }} />
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
        {mesasFiltradas.map(mesa => (
          <div key={mesa.id} style={{
            background: '#111', border: `2px solid ${estadoColor[mesa.estado]}33`,
            borderRadius: '16px', padding: '20px', position: 'relative', cursor: 'pointer',
            transition: 'all .2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = estadoColor[mesa.estado] + '88'}
          onMouseLeave={e => e.currentTarget.style.borderColor = estadoColor[mesa.estado] + '33'}
          >
            <div style={{ position: 'absolute', top: '14px', right: '14px', width: '10px', height: '10px', borderRadius: '50%', background: estadoColor[mesa.estado], boxShadow: `0 0 8px ${estadoColor[mesa.estado]}` }} />

            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: '800', color: '#f0f0f0', marginBottom: '4px' }}>
              {mesa.numero}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>{mesa.zona}</div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '14px' }}>👥 {mesa.capacidad} personas</div>

            <Badge estado={mesa.estado} />

            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {mesa.estado !== 'LIBRE' && (
                <button onClick={() => cambiarEstado(mesa.id, 'LIBRE')} style={{ background: '#14532d22', border: '1px solid #14532d', borderRadius: '8px', padding: '5px', color: '#86efac', fontSize: '11px', cursor: 'pointer' }}>
                  ✓ Marcar libre
                </button>
              )}
              {mesa.estado === 'LIBRE' && (
                <button onClick={() => cambiarEstado(mesa.id, 'OCUPADA')} style={{ background: '#7c2d1222', border: '1px solid #7c2d12', borderRadius: '8px', padding: '5px', color: '#fdba74', fontSize: '11px', cursor: 'pointer' }}>
                  Marcar ocupada
                </button>
              )}
              {mesa.estado !== 'FUERA_SERVICIO' && (
                <button onClick={() => cambiarEstado(mesa.id, 'FUERA_SERVICIO')} style={{ background: '#1c191722', border: '1px solid #44403c', borderRadius: '8px', padding: '5px', color: '#a8a29e', fontSize: '11px', cursor: 'pointer' }}>
                  Fuera servicio
                </button>
              )}
              {mesa.estado === 'LIBRE' && (
                <button onClick={() => eliminar(mesa.id, mesa.numero)} style={{ background: '#450a0a22', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '5px', color: '#fca5a5', fontSize: '11px', cursor: 'pointer' }}>
                  🗑 Eliminar
                </button>
              )}
            </div>
          </div>
        ))}

        {mesasFiltradas.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '48px', textAlign: 'center', color: '#555', fontSize: '14px' }}>
            No hay mesas en esta categoría
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Nueva Mesa" onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <Input label="Número de mesa" type="number" required min="1" value={form.numero}
              onChange={e => setForm({ ...form, numero: e.target.value })} placeholder="Ej: 11" />
            <Input label="Capacidad (personas)" type="number" required min="1" value={form.capacidad}
              onChange={e => setForm({ ...form, capacidad: e.target.value })} placeholder="Ej: 4" />
            <Select label="Zona" value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })}>
              <option>Interior</option>
              <option>Terraza</option>
              <option>VIP</option>
              <option>Bar</option>
            </Select>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit">Crear Mesa</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
