import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../api/client';
import { loginRequest, registerRequest, meRequest } from '../api/auth';

// For portfolio simplicity the JWT lives in localStorage via this context.
// Production-grade choice would be an httpOnly cookie set by the server.
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists, resolve the current user.
  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await meRequest();
        if (active) setUser(me);
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        if (active) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const result = await loginRequest(credentials);
      persist(result);
      return result.user;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const result = await registerRequest(payload);
      persist(result);
      return result.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
