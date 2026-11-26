/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const AUTH_URL = 'http://localhost:8081/api/v1/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hh_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('hh_token') || null);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('hh_user', JSON.stringify(user));
      localStorage.setItem('hh_token', token);
    } else {
      localStorage.removeItem('hh_user');
      localStorage.removeItem('hh_token');
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.message || 'Correo o contraseña incorrectos' };
      }

      const data = await res.json();
      // data = { token, id, name, email, role, puntos }
      setToken(data.token);
      setUser({ id: data.id, name: data.name, email: data.email, role: data.role, puntos: data.puntos });
      return { success: true };
    } catch {
      return { success: false, message: 'No se pudo conectar con el servidor. Verifica que el backend esté activo.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.message || 'No se pudo completar el registro.' };
      }

      // Tras registrarse, hace login automático
      return await login(email, password);
    } catch {
      return { success: false, message: 'No se pudo conectar con el servidor. Verifica que el backend esté activo.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Cabecera Authorization para cualquier fetch autenticado
  const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};
