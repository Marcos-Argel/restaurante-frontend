import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
      setEnviado(true)
    } catch {
      // Siempre mostrar éxito para no revelar si el email existe
      setEnviado(true)
    } finally {
      setLoading(false)
    }
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
          {enviado ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: '700', color: '#f0f0f0', marginBottom: '12px' }}>¡Revisa tu correo!</h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
                Si el correo existe, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <Link to="/login" style={{ color: '#c00000', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
                ← Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: '700', color: '#f0f0f0', marginBottom: '8px' }}>Recuperar contraseña</h2>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '6px', fontWeight: '500' }}>Correo electrónico</label>
                  <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#c00000'} onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                </div>
                <button type="submit" disabled={loading} style={{
                  background: loading ? '#7a0000' : 'linear-gradient(135deg, #c00000, #e00000)',
                  color: '#fff', border: 'none', borderRadius: '10px', padding: '13px',
                  fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                  {loading ? 'Enviando...' : '📨 Enviar enlace'}
                </button>
              </form>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginTop: '20px' }}>
                <Link to="/login" style={{ color: '#c00000', fontWeight: '600', textDecoration: 'none' }}>← Volver al login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}