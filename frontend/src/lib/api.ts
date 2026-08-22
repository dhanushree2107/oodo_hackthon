import axios from 'axios';
import { HRDashboardData, EmployeeDashboardData, Employee, LeaveRequest, Attendance, WorkforceInsight, Notification, Payroll } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dayflow_token');
      localStorage.removeItem('dayflow_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (payload: any) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const dashboardAPI = {
  getHRDashboard: async (): Promise<HRDashboardData> => {
    const res = await api.get('/dashboard/hr');
    return res.data;
  },
  getEmployeeDashboard: async (): Promise<EmployeeDashboardData> => {
    const res = await api.get('/dashboard/employee');
    return res.data;
  }
};

export const employeeAPI = {
  getEmployees: async (search?: string, department?: string): Promise<Employee[]> => {
    const res = await api.get('/employees', { params: { search, department } });
    return res.data;
  },
  getEmployeeById: async (id: number): Promise<Employee> => {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },
  updateEmployee: async (id: number, payload: Partial<Employee>): Promise<Employee> => {
    const res = await api.put(`/employees/${id}`, payload);
    return res.data;
  }
};

export const attendanceAPI = {
  checkIn: async (location?: string): Promise<Attendance> => {
    const res = await api.post('/attendance/check-in', { location });
    return res.data;
  },
  checkOut: async (): Promise<Attendance> => {
    const res = await api.post('/attendance/check-out', {});
    return res.data;
  },
  getAttendanceLogs: async (): Promise<Attendance[]> => {
    const res = await api.get('/attendance');
    return res.data;
  }
};

export const leaveAPI = {
  applyLeave: async (payload: { leave_type: string; start_date: string; end_date: string; reason: string }): Promise<LeaveRequest> => {
    const res = await api.post('/leave/apply', payload);
    return res.data;
  },
  reviewLeave: async (id: number, payload: { status: string; approver_comment?: string; comment?: string }): Promise<LeaveRequest> => {
    const res = await api.put(`/leave/${id}/review`, payload);
    return res.data;
  },
  approveLeave: async (id: number, payload?: { comment?: string; approver_comment?: string }): Promise<LeaveRequest> => {
    const res = await api.patch(`/leave/${id}/approve`, payload || {});
    return res.data;
  },
  rejectLeave: async (id: number, payload?: { comment?: string; approver_comment?: string }): Promise<LeaveRequest> => {
    const res = await api.patch(`/leave/${id}/reject`, payload || {});
    return res.data;
  },
  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const res = await api.get('/leave');
    return res.data;
  }
};

export const insightsAPI = {
  getInsights: async (): Promise<WorkforceInsight[]> => {
    const res = await api.get('/insights');
    return res.data;
  },
  reviewInsight: async (id: number): Promise<WorkforceInsight> => {
    const res = await api.put(`/insights/${id}/review`);
    return res.data;
  }
};

export const payrollAPI = {
  getPayrollRecords: async (): Promise<Payroll[]> => {
    const res = await api.get('/payroll');
    return res.data;
  }
};

export const notificationsAPI = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markRead: async (id: number): Promise<Notification> => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  }
};

export default api;
