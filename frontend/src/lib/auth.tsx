import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth, apiFetch } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<User | null>(getStoredUser());

  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }
    try {
      const refreshed = await apiFetch<User>('/api/auth/me');
      setUser(refreshed);
      setStoredAuth(currentToken, refreshed);
    } catch {
      clearStoredAuth();
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setStoredAuth(newToken, newUser);
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
