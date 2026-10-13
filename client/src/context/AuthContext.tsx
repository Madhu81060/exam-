import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isProjectManager: boolean;
  isTeamMember: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pm_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('pm_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          localStorage.setItem('pm_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session expired or invalid', err);
          localStorage.removeItem('pm_token');
          localStorage.removeItem('pm_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('pm_token', res.data.token);
    localStorage.setItem('pm_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const res = await authApi.register({ name, email, password, role });
    localStorage.setItem('pm_token', res.data.token);
    localStorage.setItem('pm_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
      setUser(null);
      setToken(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isProjectManager = user?.role === 'PROJECT_MANAGER';
  const isTeamMember = user?.role === 'TEAM_MEMBER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isProjectManager,
        isTeamMember,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
