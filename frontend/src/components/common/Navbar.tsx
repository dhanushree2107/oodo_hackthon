import React, { useState, useEffect } from 'react';
import { Search, Bell, User as UserIcon, LogOut, CheckCircle2, AlertTriangle, Info, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../lib/api';
import { Notification } from '../../types';

interface NavbarProps {
  onSearch?: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { auth, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-navy-900/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search employees, departments, insights..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Role Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 ${
          auth.role === 'hr_admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        }`}>
          <Shield className="w-3.5 h-3.5" />
          <span>{auth.role === 'hr_admin' ? 'HR / Enterprise Admin' : 'Employee Workspace'}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 text-slate-300 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-navy-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-88 bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <span>Notifications</span>
                  <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-mono">{notifications.length}</span>
                </h4>
                <button 
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors flex items-start space-x-3 ${!n.is_read ? 'bg-indigo-500/5' : ''}`}
                    >
                      {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                      {n.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}

                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
              {auth.full_name ? auth.full_name.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-white leading-tight">{auth.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-400">{auth.department || 'Enterprise'}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white">{auth.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{auth.email}</p>
              </div>
              <a
                href={auth.role === 'hr_admin' ? '/hr/profile' : '/employee/profile'}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors mt-1"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
