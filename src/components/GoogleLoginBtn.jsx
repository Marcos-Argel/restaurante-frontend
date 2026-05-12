import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export default function GoogleLoginBtn({ texto = 'Continuar con Google', soloExistentes = false }) {
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = parseJwt(credentialResponse.credential)
      if (!decoded) return toast.error('No se pudo leer la información de Google')

      const res = await api.post('/auth/google', {
        email: decoded.email,
        nombre: decoded.name,
        googleId: decoded.sub,
        soloExistentes
      })

      sessionStorage.setItem('token', res.data.data.token)
      sessionStorage.setItem('user', JSON.stringify(res.data.data))
      toast.success(`¡Bienvenido, ${res.data.data.nombre}!`)

      if (res.data.data.rol === 'CLIENTE') {
        navigate('/inicio')
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg?.includes('no está registrado')) {
        toast.error('No tienes cuenta. Regístrate primero.')
      } else {
        toast.error(msg || 'Error al iniciar sesión con Google')
      }
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Error al conectar con Google')}
        shape="rectangular"
        theme="filled_black"
        size="large"
        width="320"
      />
    </div>
  )
}