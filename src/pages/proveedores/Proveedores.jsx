import { useEffect, useState } from 'react'
import { getProveedores, crearProveedor, actualizarProveedor } from '../../services/api'
import { PageHeader, Modal, Input, Btn, Badge, Card, Table, Tr, Td } from '../../components/ui'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', razonSocial: '', rucNit: '', telefono: '', email: '', direccion: '', contactoNombre: '' })

  const cargar = () => getProveedores().then(r => setProveedores(r.data.data || []))

  useEffect(() => { cargar() }, [])

  const abrirModal = (p = null) => {
    if (p) {
      setForm({ nombre: p.nombre || '', razonSocial: p.razonSocial || '', rucNit: p.rucNit || '', telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '', contactoNombre: p.contactoNombre || '' })
      setEditando(p)
    } else {
      setForm({ nombre: '', razonSocial: '', rucNit: '', telefono: '', email: '', direccion: '', contactoNombre: '' })
      setEditando(null)
    }
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()

    // Validación: nombre obligatorio
    if (!form.nombre.trim()) return toast.error('El nombre es obligatorio')

    // Validación: nombre solo letras
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s&.,'-]+$/.test(form.nombre.trim())) {
      return toast.error('El nombre solo puede contener letras y caracteres válidos')
    }

    // Validación: teléfono máximo 10 dígitos
    if (form.telefono && form.telefono.replace(/\D/g, '').length > 10) {
      return toast.error('El teléfono no puede tener más de 10 dígitos')
    }

    // Validación: duplicado (solo al crear)
    if (!editando) {
      const existe = proveedores.some(p => p.nombre.toLowerCase().trim() === form.nombre.toLowerCase().trim())
      if (existe) return toast.error(`Ya existe un proveedor con el nombre "${form.nombre.trim()}"`)
    }

    try {
      if (editando) {
        await actualizarProveedor(editando.id, form)
        toast.success('Proveedor actualizado')
      } else {
        await crearProveedor(form)
        toast.success('Proveedor creado')
      }
      setModal(false)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const cambiarEstado = async (id, activo) => {
    try {
      await api.patch(`/proveedores/${id}/estado?activo=${activo}`)
      toast.success(activo ? 'Proveedor activado' : 'Proveedor desactivado')
      cargar()
    } catch { toast.error('Error') }
  }

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar permanentemente a "${nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/proveedores/${id}`)
      toast.success('Proveedor eliminado')
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Proveedores"
        sub={`${proveedores.length} proveedores registrados`}
        action={<Btn onClick={() => abrirModal()}>+ Nuevo Proveedor</Btn>}
      />

      <Card>
        <Table headers={['Proveedor', 'Contacto', 'Teléfono', 'Email', 'Dirección', 'Estado', 'Acciones']}>
          {proveedores.map(p => (
            <Tr key={p.id}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f9731622', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: '800', color: '#f97316', fontSize: '14px', flexShrink: 0 }}>
                    {p.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#f0f0f0', fontSize: '13px' }}>{p.nombre}</div>
                    {p.rucNit && <div style={{ color: '#666', fontSize: '11px' }}>NIT: {p.rucNit}</div>}
                  </div>
                </div>
              </Td>
              <Td><span style={{ color: '#aaa', fontSize: '13px' }}>{p.contactoNombre || '—'}</span></Td>
              <Td><span style={{ color: '#aaa', fontSize: '13px' }}>{p.telefono || '—'}</span></Td>
              <Td><span style={{ color: '#aaa', fontSize: '13px' }}>{p.email || '—'}</span></Td>
              <Td><span style={{ color: '#666', fontSize: '12px' }}>{p.direccion || '—'}</span></Td>
              <Td><Badge estado={p.activo ? 'ACTIVO' : 'INACTIVO'} /></Td>
              <Td>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button onClick={() => abrirModal(p)} style={{ background: '#1e3a5f', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#93c5fd', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                    Editar
                  </button>
                  {p.activo ? (
                    <button onClick={() => cambiarEstado(p.id, false)} style={{ background: '#450a0a', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#fca5a5', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Desactivar
                    </button>
                  ) : (
                    <button onClick={() => cambiarEstado(p.id, true)} style={{ background: '#14532d', border: 'none', borderRadius: '6px', padding: '4px 10px', color: '#86efac', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Activar
                    </button>
                  )}
                  <button onClick={() => eliminar(p.id, p.nombre)} title="Eliminar proveedor" style={{ background: '#3b0a0a', border: '1px solid #7f1d1d', borderRadius: '6px', width: '28px', height: '28px', color: '#ef4444', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    🗑
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
          {proveedores.length === 0 && (
            <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#555' }}>No hay proveedores registrados</td></tr>
          )}
        </Table>
      </Card>

      {modal && (
        <Modal title={editando ? 'Editar Proveedor' : 'Nuevo Proveedor'} onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <Input label="Nombre comercial" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Distribuidora Central" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Razón social" value={form.razonSocial} onChange={e => setForm({ ...form, razonSocial: e.target.value })} placeholder="Nombre legal" />
              <Input label="NIT / RUC" value={form.rucNit} onChange={e => setForm({ ...form, rucNit: e.target.value })} placeholder="Ej: 900123456-1" />
            </div>
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
              <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ventas@proveedor.com" />
            </div>
            <Input label="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Principal 123" />
            <Input label="Nombre del contacto" value={form.contactoNombre} onChange={e => setForm({ ...form, contactoNombre: e.target.value })} placeholder="Ej: Juan García" />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Btn variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit">{editando ? 'Actualizar' : 'Crear Proveedor'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}