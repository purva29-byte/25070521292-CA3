import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { getApiError } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const current = await authService.me();
      setUser(current);
      return current;
    } catch (error) {
      if (error?.response?.status !== 401) {
        // A network failure should not look like a successful sign-out.
        console.warn('Could not restore the session:', getApiError(error));
      }
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((current) => {
        if (active) setUser(current);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setBooting(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const current = await authService.login(credentials);
    setUser(current);
    return current;
  }, []);

  const register = useCallback(async (payload) => {
    const current = await authService.register(payload);
    setUser(current);
    return current;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser((previous) => ({ ...previous, ...nextUser }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, booting, login, register, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
