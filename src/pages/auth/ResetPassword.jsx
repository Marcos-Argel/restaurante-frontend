import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirmar: '' })
  const [loading, setLoading] = useState(false)
  const [tokenValido, setTokenValido] = useState(null)

  useEffect(() => {
    if (!token) { setTokenValido(false); return }
    api.get(`/auth/validate-token?token=${token}`)
      .then(r => setTokenValido(r.data.data))
      .catch(() => setTokenValido(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Mínimo 6 caracteres')
    if (form.password !== form.confirmar) return toast.error('Las contraseñas no coinciden')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, nuevaPassword: form.password })
      toast.success('¡Contraseña actualizada!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al restablecer')
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
      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #c00000, #e00000)', borderRadius: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '14px' }}>🐔</div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '26px', fontWeight: '800', color: '#f0f0f0' }}>Fast & Healthy</h1>
        </div>

        <div style={{ background: '#111', border: '1px solid #2a0000', borderRadius: '20px', padding: '32px' }}>
          {tokenValido === null && <p style={{ color: '#888', textAlign: 'center' }}>Validando enlace...</p>}
          {tokenValido === false && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
              <h2 style={{ color: '#f0f0f0', fontFamily: 'Poppins, sans-serif', marginBottom: '12px' }}>Enlace inválido</h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Este enlace expiró o ya fue usado.</p>
              <Link to="/forgot-password" style={{ color: '#c00000', fontWeight: '600', textDecoration: 'none' }}>Solicitar nuevo enlace</Link>
            </div>
          )}
          {tokenValido === true && (
            <>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: '700', color: '#f0f0f0', marginBottom: '20px' }}>Nueva contraseña</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>Nueva contraseña</label>
                  <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#c00000'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>Confirmar contraseña</label>
                  <input type="password" required value={form.confirmar} onChange={e => setForm({ ...form, confirmar: e.target.value })}
                    placeholder="Repite tu contraseña" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#c00000'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                </div>
                <button type="submit" disabled={loading} style={{
                  background: loading ? '#7a0000' : 'linear-gradient(135deg, #c00000, #e00000)',
                  color: '#fff', border: 'none', borderRadius: '10px', padding: '13px',
                  fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                  {loading ? 'Actualizando...' : '🔐 Actualizar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}