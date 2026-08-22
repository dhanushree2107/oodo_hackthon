import React, { createContext, useContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import { AuthState } from '../types';
import { authAPI } from '../lib/api';

interface AuthContextType {
  auth: AuthState;
  login: (credentials: any) => Promise<any>;
  register: (payload: any) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
}

const defaultState: AuthState = {
  token: localStorage.getItem('dayflow_token'),
  role: (localStorage.getItem('dayflow_role') as 'hr_admin' | 'employee') || null,
  user_id: localStorage.getItem('dayflow_user_id') ? Number(localStorage.getItem('dayflow_user_id')) : null,
  email: localStorage.getItem('dayflow_email'),
  full_name: localStorage.getItem('dayflow_full_name'),
  employee_code: localStorage.getItem('dayflow_employee_code'),
  department: localStorage.getItem('dayflow_department'),
  job_title: localStorage.getItem('dayflow_job_title'),
  employee_id: localStorage.getItem('dayflow_employee_id') ? Number(localStorage.getItem('dayflow_employee_id')) : null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(defaultState);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const saveAuthData = (data: any) => {
    localStorage.setItem('dayflow_token', data.access_token);
    localStorage.setItem('dayflow_role', data.role);
    localStorage.setItem('dayflow_user_id', String(data.user_id));
    localStorage.setItem('dayflow_email', data.email);
    localStorage.setItem('dayflow_full_name', data.full_name);
    if (data.employee_code) localStorage.setItem('dayflow_employee_code', data.employee_code);
    if (data.department) localStorage.setItem('dayflow_department', data.department);
    if (data.job_title) localStorage.setItem('dayflow_job_title', data.job_title);
    if (data.employee_id) localStorage.setItem('dayflow_employee_id', String(data.employee_id));

    setAuth({
      token: data.access_token,
      role: data.role,
      user_id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      employee_code: data.employee_code,
      department: data.department,
      job_title: data.job_title,
      employee_id: data.employee_id
    });
  };

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await authAPI.login(credentials);
      saveAuthData(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const data = await authAPI.register(payload);
      saveAuthData(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setAuth({
      token: null,
      role: null,
      user_id: null,
      email: null,
      full_name: null,
      employee_code: null,
      department: null,
      job_title: null,
      employee_id: null,
    });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, isLoading }}>
=======
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
>>>>>>> a46455f2533f3d5280c535476a12159845fb687c
      {children}
    </AuthContext.Provider>
  );
};

<<<<<<< HEAD
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
=======
export const useAuth = () => useContext(AuthContext);
>>>>>>> a46455f2533f3d5280c535476a12159845fb687c
