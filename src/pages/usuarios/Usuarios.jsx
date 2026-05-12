import { useEffect, useState } from 'react'
import { getUsuarios, crearUsuario, actualizarUsuario, cambiarEstadoUsuario, getRoles } from '../../services/api'
import { PageHeader, Modal, Input, Select, Btn, Badge, Card, Table, Tr, Td } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function Usuarios() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '', rolId: '' })

  const cargar = () => {
    getUsuarios().then(r => setUsuarios(r.data.data || []))
    getRoles().then(r => {
      const todosRoles = r.data.data || []
      if (user?.rol === 'GERENTE') {
        setRoles(todosRoles.filter(r => !['ADMIN', 'GERENTE'].includes(r.nombre)))
      } else {
        setRoles(todosRoles)
      }
    })
  }

  useEffect(() => { cargar() }, [])

  const abrirModal = (u = null) => {
    if (u) {
      // FIX: usar u.rolId directamente porque u.rol ahora es string
      setForm({ nombre: u.nombre, email: u.email, password: '', telefono: u.telefono || '', rolId: u.rolId || '' })
      setEditando(u)
    } else {
      setForm({ nombre: '', email: '', password: '', telefono: '', rolId: '' })
      setEditando(null)
    }
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(form.nombre.trim())) {
      toast.error('El nombre solo puede contener letras')
      return
    }
    if (form.telefono && form.telefono.replace(/\D/g, '').length > 10) {
      toast.error('El teléfono no puede tener más de 10 dígitos')
      return
    }
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (editando) {
        await actualizarUsuario(editando.id, payload)
        toast.success('Usuario actualizado')
      } else {
        await crearUsuario(payload)
        toast.success('Usuario creado')
      }
      setModal(false)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const cambiarEstado = async (id, activo) => {
    try {
      await cambiarEstadoUsuario(id, activo)
      toast.success(activo ? 'Usuario activado' : 'Usuario desactivado')
      cargar()
    } catch { toast.error('Error') }
  }

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar permanentemente al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/usuarios/${id}`)
      toast.success('Usuario eliminado')
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const rolColor = {
    ADMIN: '#f97316', GERENTE: '#a855f7', MESERO: '#3b82f6',
    COCINERO: '#ef4444', CAJERO: '#22c55e', BARTENDER: '#f59e0b',
    CLIENTE: '#06b6d4'
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Usuarios"
        sub={`${usuarios.length} usuarios registrados`}
        action={<Btn onClick={() => abrirModal()}>+ Nuevo Usuario</Btn>}
      />

      <Card>
        <Table headers={['Usuario', 'Email', 'Teléfono', 'Rol', 'Estado', 'Último acceso', 'Acciones']}>
          {usuarios.map(u => (
            <Tr key={u.id}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* FIX: u.rol es string directo, no objeto */}
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: (rolColor[u.rol] || '#888') + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: '800', color: rolColor[u.rol] || '#888', fontSize: '14px' }}>
                    {u.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: '600', color: '#f0f0f0' }}>{u.nombre}</span>
                </div>
              </Td>
              <Td>{u.email}</Td>
              <Td>{u.telefono || '—'}</Td>
              <Td>
                {/* FIX: u.rol es string directo */}
                <span style={{ background: (rolColor[u.rol] || '#888') + '22', color: rolColor[u.rol] || '#888', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {u.rol || '—'}
                </span>
              </Td>
              <Td><Badge estado={u.activo ? 'ACTIVO' : 'INACTIVO'} /></Td>
              <Td><span style={{ color: '#666', fontSize: '12px' }}>{u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString('es-CO') : 'Nunca'}</span></Td>
              <Td>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button onClick={() => abrirModal(u)} style={{ background: '#1e3a5f', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#93c5fd', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                    Editar
                  </button>
                  {u.activo ? (
                    <button onClick={() => cambiarEstado(u.id, false)} style={{ background: '#450a0a', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#fca5a5', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Desactivar
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(u.id, true)} style={{ background: '#14532d', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#86efac', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Activar
                    </button>
                  )}
                  <button
                    onClick={() => eliminar(u.id, u.nombre)}
                    title="Eliminar usuario"
                    style={{ background: '#3b0a0a', border: '1px solid #7f1d1d', borderRadius: '6px', width: '28px', height: '28px', color: '#ef4444', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    🗑
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {modal && (
        <Modal title={editando ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <Input label="Nombre completo" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Juan Pérez" />
            <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="juan@restaurante.com" />
            <Input label={editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'} type="password" required={!editando} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Teléfono"
                value={form.telefono}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setForm({ ...form, telefono: val })
                }}
                placeholder="300 000 0000"
              />
              <Select label="Rol" required value={form.rolId} onChange={e => setForm({ ...form, rolId: e.target.value })}>
                <option value="">Seleccionar rol</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Btn variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit">{editando ? 'Actualizar' : 'Crear Usuario'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}