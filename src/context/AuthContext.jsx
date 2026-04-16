import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión persistente al iniciar la app
  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error("Error al parsear el usuario del sessionStorage", error);
        sessionStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  /**
   * ✅ CORRECCIÓN TÉCNICA: 
   * Usamos { email, password } para desestructurar el objeto que viene del Formulario.
   * Esto evita enviar un JSON anidado al Backend y previene el error 500 de Jackson.
   */
  const login = async ({ email, password }) => {
    const res = await loginApi({ email, password });
    
    // Extraemos la data según la estructura de tu ApiResponse de Spring
    const data = res.data.data; 

    // Guardar en almacenamiento de sesión para persistencia
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data));
    
    setUser(data);
    return data;
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  // Helper para verificar roles (útil en rutas protegidas)
  const hasRole = (...roles) => roles.includes(user?.rol);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);