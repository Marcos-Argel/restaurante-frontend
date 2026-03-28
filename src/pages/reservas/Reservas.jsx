import { useEffect, useState } from 'react'
import { getReservas, crearReserva, cambiarEstadoReserva, getMesas } from '../../services/api'
import { PageHeader, Modal, Input, Select, Btn, Badge, Card, Table, Tr, Td } from '../../components/ui'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function Reservas() {
  const [reservas, setReservas] = useState([])
  const [mesas, setMesas] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ clienteNombre: '', clienteTelefono: '', mesaId: '', fechaReserva: '', horaReserva: '', numeroPersonas: '', notasEspeciales: '' })

  const cargar = () => {
    getReservas().then(r => setReservas(r.data.data || []))
    getMesas().then(r => setMesas(r.data.data || []))
  }

  useEffect(() => { cargar() }, [])

  const mesaSeleccionada = mesas.find(m => m.id == form.mesaId)
  const anticipo = mesaSeleccionada?.zona === 'VIP' ? 100000 : mesaSeleccionada ? 50000 : 0

  const guardar = async (e) => {
    e.preventDefault()

    if (/^[0-9]+$/.test(form.clienteNombre.trim()))
      return toast.error('El nombre del cliente no puede ser solo números')

    if (form.fechaReserva < new Date().toISOString().split('T')[0])
      return toast.error('No se puede crear una reserva en una fecha pasada')

    if (form.clienteTelefono && form.clienteTelefono.replace(/\D/g, '').length > 10)
      return toast.error('El teléfono no puede tener más de 10 dígitos')

    if (mesaSeleccionada && Number(form.numeroPersonas) > mesaSeleccionada.capacidad)
      return toast.error(`La mesa ${mesaSeleccionada.numero} solo tiene capacidad para ${mesaSeleccionada.capacidad} personas`)

    if (Number(form.numeroPersonas) <= 0)
      return toast.error('El número de personas debe ser mayor a 0')

    const fechaHora = form.fechaReserva && form.horaReserva ? `${form.fechaReserva}T${form.horaReserva}:00` : null

    const nuevaHora = new Date(fechaHora)
    const conflicto = reservas.find(r => {
      if (r.mesa?.id != form.mesaId || r.estado === 'CANCELADA') return false
      const horaExistente = new Date(r.fechaReserva)
      const diff = Math.abs(nuevaHora - horaExistente) / 36e5
      return diff < 2
    })
    if (conflicto) {
      const horaConflicto = new Date(conflicto.fechaReserva).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      return toast.error(`La mesa ya tiene una reserva a las ${horaConflicto}. Debe haber al menos 2 horas de diferencia.`)
    }

    try {
      await crearReserva({
        clienteNombre: form.clienteNombre,
        clienteTelefono: form.clienteTelefono,
        mesaId: form.mesaId ? Number(form.mesaId) : null,
        fechaReserva: fechaHora,
        cantidadPersonas: Number(form.numeroPersonas),
        notas: form.notasEspeciales || null,
        anticipo: anticipo
      })
      toast.success(`Reserva creada — Anticipo: ${anticipo.toLocaleString()}`)
      setModal(false)
      setForm({ clienteNombre: '', clienteTelefono: '', mesaId: '', fechaReserva: '', horaReserva: '', numeroPersonas: '', notasEspeciales: '' })
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear reserva')
    }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoReserva(id, estado)
      toast.success('Estado actualizado')
      cargar()
    } catch { toast.error('Error') }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta reserva? Esta acción no se puede deshacer.')) return
    try {
      await api.delete(`/reservas/${id}`)
      toast.success('Reserva eliminada')
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se puede eliminar la reserva')
    }
  }

  const hoy = new Date().toISOString().split('T')[0]
  const reservasHoy = reservas.filter(r => r.fechaReserva?.startsWith(hoy))

  return (
    <div className="fade-in">
      <PageHeader
        title="Reservas"
        sub={`${reservasHoy.length} reservas hoy`}
        action={<Btn onClick={() => setModal(true)}>+ Nueva Reserva</Btn>}
      />

      <Card>
        <Table headers={['Cliente', 'Teléfono', 'Mesa', 'Fecha y Hora', 'Personas', 'Anticipo', 'Estado', 'Acciones']}>
          {reservas.map(r => (
            <Tr key={r.id}>
              <Td><span style={{ fontWeight: '600', color: '#f0f0f0' }}>{r.clienteNombre}</span></Td>
              <Td>{r.clienteTelefono || '—'}</Td>
              <Td>Mesa {r.mesa?.numero} — {r.mesa?.zona}</Td>
              <Td>{r.fechaReserva ? new Date(r.fechaReserva).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</Td>
              <Td>👥 {r.cantidadPersonas}</Td>
              <Td>
                {r.anticipo
                  ? <span style={{ color: '#22c55e', fontWeight: 600 }}>${Number(r.anticipo).toLocaleString()}</span>
                  : <span style={{ color: '#444' }}>—</span>}
              </Td>
              <Td><Badge estado={r.estado} /></Td>
              <Td>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {r.estado === 'PENDIENTE' && (
                    <button onClick={() => cambiarEstado(r.id, 'CONFIRMADA')} style={{ background: '#14532d', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#86efac', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Confirmar
                    </button>
                  )}
                  {(r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA') && (
                    <button onClick={() => cambiarEstado(r.id, 'CANCELADA')} style={{ background: '#450a0a', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#fca5a5', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Cancelar
                    </button>
                  )}
                  {r.estado === 'CONFIRMADA' && (
                    <button onClick={() => cambiarEstado(r.id, 'COMPLETADA')} style={{ background: '#1e3a5f', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#93c5fd', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Completar
                    </button>
                  )}
                  <button onClick={() => eliminar(r.id)} style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: '6px', padding: '4px 10px', color: '#fca5a5', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                    🗑
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
          {reservas.length === 0 && (
            <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#555' }}>No hay reservas</td></tr>
          )}
        </Table>
      </Card>

      {modal && (
        <Modal title="Nueva Reserva" onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Nombre del cliente" required value={form.clienteNombre}
                onChange={e => setForm({ ...form, clienteNombre: e.target.value })} placeholder="Juan García" />
              <Input label="Teléfono (máx 10 dígitos)" value={form.clienteTelefono}
                onChange={e => setForm({ ...form, clienteTelefono: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="3001234567" maxLength={10} />
              <Input label="Fecha" type="date" required value={form.fechaReserva}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, fechaReserva: e.target.value })} />
              <Input label="Hora" type="time" required value={form.horaReserva}
                onChange={e => setForm({ ...form, horaReserva: e.target.value })} />
              <Select label="Mesa" required value={form.mesaId}
                onChange={e => setForm({ ...form, mesaId: e.target.value, numeroPersonas: '' })}>
                <option value="">Seleccionar mesa</option>
                {mesas.filter(m => m.estado === 'LIBRE' || m.estado === 'RESERVADA').map(m => (
                  <option key={m.id} value={m.id}>Mesa {m.numero} — {m.zona} (máx {m.capacidad} personas)</option>
                ))}
              </Select>
              <div>
                <Input label={`Personas${mesaSeleccionada ? ` (máx ${mesaSeleccionada.capacidad})` : ''}`}
                  type="number" required min="1"
                  max={mesaSeleccionada ? mesaSeleccionada.capacidad : undefined}
                  value={form.numeroPersonas}
                  onChange={e => setForm({ ...form, numeroPersonas: e.target.value })}
                  placeholder="2" />
                {mesaSeleccionada && Number(form.numeroPersonas) > mesaSeleccionada.capacidad && (
                  <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>⚠️ Supera la capacidad máxima</div>
                )}
              </div>
            </div>

            {/* Anticipo automático según zona */}
            {mesaSeleccionada && (
              <div style={{ background: '#14532d22', border: '1px solid #14532d', borderRadius: '10px', padding: '12px 16px', margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#86efac', fontWeight: 600 }}>💰 Anticipo a cobrar</div>
                  <div style={{ fontSize: '11px', color: '#555', marginTop: 2 }}>
                    {mesaSeleccionada.zona === 'VIP' ? 'Mesa VIP — tarifa especial' : 'Mesa estándar'}
                  </div>
                </div>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#22c55e', fontFamily: 'Poppins' }}>${anticipo.toLocaleString()}</span>
              </div>
            )}

            <Input label="Notas especiales" value={form.notasEspeciales}
              onChange={e => setForm({ ...form, notasEspeciales: e.target.value })}
              placeholder="Alergias, ocasión especial, preferencias..." />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Btn variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit">Crear Reserva</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
