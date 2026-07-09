import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi } from '../api/auth';

const AuthContext = createContext(null);

// Demo credentials for offline/frontend-only mode
const DEMO_USER = {
  _id: 'demo-001',
  name: 'Admin User',
  email: 'admin@tailorpro.com',
  role: 'admin',
};
const DEMO_TOKEN = 'demo-jwt-token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // Try real backend first
      const res = await loginApi({ email, password });
      const { token: tk, data } = res.data;
      localStorage.setItem('token', tk);
      localStorage.setItem('user', JSON.stringify(data));
      setToken(tk);
      setUser(data);
      return { success: true };
    } catch (err) {
      // Demo fallback — accept any credentials or demo ones
      const isDemoLogin =
        (email === 'admin@tailorpro.com' && password === 'admin123') ||
        err.code === 'ERR_NETWORK' ||
        err.code === 'ECONNREFUSED' ||
        !err.response; // network error means backend is offline

      if (isDemoLogin) {
        localStorage.setItem('token', DEMO_TOKEN);
        localStorage.setItem('user', JSON.stringify(DEMO_USER));
        setToken(DEMO_TOKEN);
        setUser(DEMO_USER);
        return { success: true };
      }
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
