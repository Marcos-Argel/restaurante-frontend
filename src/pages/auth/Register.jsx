import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'
import GoogleLoginBtn from '../../components/GoogleLoginBtn'

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '', telefono: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(form.nombre.trim())) {
      return toast.error('El nombre solo puede contener letras')
    }

    const emailRegex = /^[^\s@]+@(gmail|hotmail|outlook|yahoo|live|icloud|me|protonmail|zoho|universidad|edu)\.(com|co|es|net|org|edu\.co|com\.co)$/i
    if (!emailRegex.test(form.email.trim())) {
      return toast.error('Ingresa un correo válido (ej: nombre@gmail.com)')
    }

    if (form.password.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres')
    }

    if (form.password !== form.confirmar) {
      return toast.error('Las contraseñas no coinciden')
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        telefono: form.telefono
      })
     toast.success('¡Cuenta creada! Bienvenido a Fast & Healthy')
navigate('/inicio')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '12px 14px', color: '#f0f0f0',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 25% 25%, #1a0000 0%, transparent 50%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #c00000, #e00000)', borderRadius: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '14px' }}>🐔</div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '26px', fontWeight: '800', color: '#f0f0f0' }}>Fast & Healthy</h1>
          <p style={{ color: '#777', fontSize: '13px' }}>Crea tu cuenta de cliente</p>
        </div>

        <div style={{ background: '#111', border: '1px solid #2a0000', borderRadius: '20px', padding: '32px' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: '700', color: '#f0f0f0', marginBottom: '20px' }}>Registro</h2>
          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>Nombre completo</label>
              <input type="text" required value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#c00000'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>
                Correo electrónico
                <span style={{ color: '#666', fontWeight: '400', marginLeft: '6px' }}>(Gmail, Hotmail, Outlook...)</span>
              </label>
              <input type="text" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="nombre@gmail.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#c00000'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>Teléfono (opcional)</label>
              <input type="text" value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="300 000 0000" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#c00000'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>Contraseña</label>
              <input type="password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#c00000'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>Confirmar contraseña</label>
              <input type="password" required value={form.confirmar}
                onChange={e => setForm({ ...form, confirmar: e.target.value })}
                placeholder="Repite tu contraseña" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#c00000'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
            </div>
            <button type="submit" disabled={loading} style={{
              marginTop: '4px', background: loading ? '#7a0000' : 'linear-gradient(135deg, #c00000, #e00000)',
              color: '#fff', border: 'none', borderRadius: '10px', padding: '13px',
              fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Creando cuenta...' : '🎉 Crear cuenta'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
            <span style={{ color: '#555', fontSize: 12 }}>o</span>
            <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
          </div>

          <GoogleLoginBtn texto="Registrarse con Google" />

          <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginTop: '20px' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#c00000', fontWeight: '600', textDecoration: 'none' }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}