import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default App;
