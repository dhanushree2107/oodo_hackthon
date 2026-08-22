import React, { createContext, useContext, useState, useEffect } from 'react';
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
