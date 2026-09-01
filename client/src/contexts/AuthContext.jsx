/* oxlint-disable react/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register(name, email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (name, email) => {
    const { data } = await authAPI.updateProfile(name, email);
    setUser(data.user);
    return data;
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    const { data } = await authAPI.updatePassword(currentPassword, newPassword);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const value = { user, login, register, logout, updateProfile, updatePassword, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
