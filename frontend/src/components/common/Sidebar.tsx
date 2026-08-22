import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarCheck, 
  CreditCard, 
  Sparkles, 
  BarChart3, 
  UserCircle, 
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { auth, logout } = useAuth();
  const isHR = auth.role === 'hr_admin';

  interface NavItem {
    label: string;
    icon: any;
    path: string;
    badge?: string;
  }

  const hrNavItems: NavItem[] = [
    { label: 'Command Center', icon: LayoutDashboard, path: '/hr/dashboard' },
    { label: 'Employees', icon: Users, path: '/hr/employees' },
    { label: 'Attendance', icon: Clock, path: '/hr/attendance' },
    { label: 'Leave Approvals', icon: CalendarCheck, path: '/hr/leave' },
    { label: 'Payroll', icon: CreditCard, path: '/hr/payroll' },
    { label: 'Workforce Insights', icon: Sparkles, path: '/hr/insights', badge: 'AI' },
    { label: 'Reports', icon: BarChart3, path: '/hr/reports' },
    { label: 'Profile', icon: UserCircle, path: '/hr/profile' },
  ];

  const employeeNavItems: NavItem[] = [
    { label: 'My Workspace', icon: LayoutDashboard, path: '/employee/dashboard' },
    { label: 'Attendance Log', icon: Clock, path: '/employee/attendance' },
    { label: 'Leave Requests', icon: CalendarCheck, path: '/employee/leave' },
    { label: 'Payroll & Paystub', icon: CreditCard, path: '/employee/payroll' },
    { label: 'My Profile', icon: UserCircle, path: '/employee/profile' },
  ];

  const navItems = isHR ? hrNavItems : employeeNavItems;

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-40 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center space-x-1">
              <span>DAYFLOW</span>
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-mono font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">ENT</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Workforce Intelligence</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {isHR ? 'HR Operations' : 'Employee Portal'}
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-indigo-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Branding & Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-800 mb-3">
          <p className="text-[11px] font-semibold text-slate-300">Dayflow Enterprise v1.0</p>
          <p className="text-[10px] text-slate-500 mt-0.5">"Every workday, perfectly aligned."</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
