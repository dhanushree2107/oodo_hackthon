import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'SUPER_ADMIN' | 'HR_OFFICER' | 'EMPLOYEE';
  employee_id?: string;
  employee_code?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string, userData: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dayflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dayflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dayflow_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          const meData = res.data;
          setUser((prev) => ({
            ...prev,
            id: meData.id,
            email: meData.email,
            full_name: meData.full_name,
            role: meData.role,
            employee_id: meData.employee_id,
          }));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (newToken: string, newRefreshToken: string, userData: UserProfile) => {
    localStorage.setItem('dayflow_token', newToken);
    localStorage.setItem('dayflow_refresh_token', newRefreshToken);
    localStorage.setItem('dayflow_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_refresh_token');
    localStorage.removeItem('dayflow_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

