import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/common/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HRDashboardPage } from './pages/HRDashboardPage';
import { EmployeeDashboardPage } from './pages/EmployeeDashboardPage';
import { EmployeesDirectoryPage } from './pages/EmployeesDirectoryPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeaveManagementPage } from './pages/LeaveManagementPage';
import { PayrollPage } from './pages/PayrollPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'hr_admin' | 'employee' }> = ({
  children,
  allowedRole
}) => {
  const { auth } = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && auth.role !== allowedRole) {
    return <Navigate to={auth.role === 'hr_admin' ? '/hr/dashboard' : '/employee/dashboard'} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export const AppContent: React.FC = () => {
  const { auth } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={
        auth.token ? (
          <Navigate to={auth.role === 'hr_admin' ? '/hr/dashboard' : '/employee/dashboard'} replace />
        ) : (
          <LoginPage />
        )
      } />

      <Route path="/register" element={<RegisterPage />} />

      {/* HR Admin Protected Routes */}
      <Route path="/hr/dashboard" element={<ProtectedRoute allowedRole="hr_admin"><HRDashboardPage /></ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute allowedRole="hr_admin"><EmployeesDirectoryPage /></ProtectedRoute>} />
      <Route path="/hr/attendance" element={<ProtectedRoute allowedRole="hr_admin"><AttendancePage /></ProtectedRoute>} />
      <Route path="/hr/leave" element={<ProtectedRoute allowedRole="hr_admin"><LeaveManagementPage /></ProtectedRoute>} />
      <Route path="/hr/leaves" element={<ProtectedRoute allowedRole="hr_admin"><LeaveManagementPage /></ProtectedRoute>} />
      <Route path="/hr/payroll" element={<ProtectedRoute allowedRole="hr_admin"><PayrollPage /></ProtectedRoute>} />
      <Route path="/hr/insights" element={<ProtectedRoute allowedRole="hr_admin"><HRDashboardPage /></ProtectedRoute>} />
      <Route path="/hr/reports" element={<ProtectedRoute allowedRole="hr_admin"><ReportsPage /></ProtectedRoute>} />
      <Route path="/hr/profile" element={<ProtectedRoute allowedRole="hr_admin"><ProfilePage /></ProtectedRoute>} />

      {/* Employee Protected Routes */}
      <Route path="/employee/dashboard" element={<ProtectedRoute allowedRole="employee"><EmployeeDashboardPage /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute allowedRole="employee"><AttendancePage /></ProtectedRoute>} />
      <Route path="/employee/leave" element={<ProtectedRoute allowedRole="employee"><LeaveManagementPage /></ProtectedRoute>} />
      <Route path="/employee/payroll" element={<ProtectedRoute allowedRole="employee"><PayrollPage /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute allowedRole="employee"><ProfilePage /></ProtectedRoute>} />

      {/* Fallback Catch-all Route */}
      <Route path="*" element={
        <Navigate to={
          auth.token
            ? auth.role === 'hr_admin' ? '/hr/dashboard' : '/employee/dashboard'
            : '/login'
        } replace />
      } />
    </Routes>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
