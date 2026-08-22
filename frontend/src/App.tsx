import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
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

=======
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Employee Workspace Pages
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { EmployeeAttendance } from './pages/EmployeeAttendance';
import { EmployeeLeave } from './pages/EmployeeLeave';
import { EmployeePayroll } from './pages/EmployeePayroll';
import { EmployeeDocuments } from './pages/EmployeeDocuments';
import { EmployeeAICopilot } from './pages/EmployeeAICopilot';

// Admin / HR Hub Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminEmployees } from './pages/AdminEmployees';
import { AdminAttendance } from './pages/AdminAttendance';
import { AdminLeaves } from './pages/AdminLeaves';
import { AdminPayroll } from './pages/AdminPayroll';
import { AdminDocuments } from './pages/AdminDocuments';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminReports } from './pages/AdminReports';
import { AdminAIInsights } from './pages/AdminAIInsights';
import { AdminSecurity } from './pages/AdminSecurity';
import { AdminAuditLogs } from './pages/AdminAuditLogs';
import { AdminSettings } from './pages/AdminSettings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Employee Workspace */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'HR_OFFICER', 'SUPER_ADMIN']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/profile" element={<EmployeeProfile />} />
              <Route path="/employee/attendance" element={<EmployeeAttendance />} />
              <Route path="/employee/leave" element={<EmployeeLeave />} />
              <Route path="/employee/payroll" element={<EmployeePayroll />} />
              <Route path="/employee/documents" element={<EmployeeDocuments />} />
              <Route path="/employee/notifications" element={<EmployeeDashboard />} />
              <Route path="/employee/ai-copilot" element={<EmployeeAICopilot />} />
            </Route>
          </Route>

          {/* Protected Admin & HR Hub */}
          <Route element={<ProtectedRoute allowedRoles={['HR_OFFICER', 'SUPER_ADMIN']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<AdminEmployees />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
              <Route path="/admin/leaves" element={<AdminLeaves />} />
              <Route path="/admin/payroll" element={<AdminPayroll />} />
              <Route path="/admin/documents" element={<AdminDocuments />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/ai-insights" element={<AdminAIInsights />} />
              <Route path="/admin/security" element={<AdminSecurity />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

>>>>>>> a46455f2533f3d5280c535476a12159845fb687c
export default App;
