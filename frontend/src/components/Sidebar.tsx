import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Bell,
  Bot,
  Users,
  BarChart3,
  FileSpreadsheet,
  Brain,
  ShieldCheck,
  History,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_OFFICER';

  const employeeNav = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/employee/profile', icon: User },
    { label: 'Attendance', path: '/employee/attendance', icon: Clock },
    { label: 'Leave Workflows', path: '/employee/leave', icon: CalendarDays },
    { label: 'Payroll & Slips', path: '/employee/payroll', icon: CircleDollarSign },
    { label: 'Documents', path: '/employee/documents', icon: FileText },
    { label: 'Notifications', path: '/employee/notifications', icon: Bell },
    { label: 'AI Copilot', path: '/employee/ai-copilot', icon: Bot, badge: 'AI' },
  ];

  const adminNav = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Employee Directory', path: '/admin/employees', icon: Users },
    { label: 'Attendance Matrix', path: '/admin/attendance', icon: Clock },
    { label: 'Leave Approvals', path: '/admin/leaves', icon: CalendarDays },
    { label: 'Payroll Engine', path: '/admin/payroll', icon: CircleDollarSign },
    { label: 'Document Vault', path: '/admin/documents', icon: FileText },
    { label: 'HR Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Export Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'AI Workforce Insights', path: '/admin/ai-insights', icon: Brain, badge: 'Pulse' },
    { label: 'Security Center', path: '/admin/security', icon: ShieldCheck },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const items = isAdmin ? adminNav : employeeNav;

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-800 bg-[#0F172A] flex flex-col justify-between p-4">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wider">DAYFLOW</h1>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
              {isAdmin ? 'ENTERPRISE HR OPERATING SYSTEM' : 'EMPLOYEE WORKSPACE'}
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Profile Mini-card */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
