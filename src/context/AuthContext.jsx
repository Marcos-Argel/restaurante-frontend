import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

// ✅ CORRECCIÓN: Añade llaves a los parámetros
const login = async ({ email, password }) => { 
  const res = await loginApi({ email, password });
  const data = res.data.data;
  sessionStorage.setItem('token', data.token);
  sessionStorage.setItem('user', JSON.stringify(data));
  setUser(data);
  return data;
};

  const logout = () => {
    sessionStorage.clear()
    setUser(null)
  }

  const hasRole = (...roles) => roles.includes(user?.rol)

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
