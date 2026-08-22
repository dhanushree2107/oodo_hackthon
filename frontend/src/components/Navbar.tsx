import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [wsConnected, setWsConnected] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
    } catch (err) {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md px-6 flex items-center justify-between">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search employees, documents, leaves..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-4">
        {/* Real-time Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>LIVE WS</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <h3 className="text-xs font-bold text-slate-200">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-indigo-400 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border text-xs ${
                        n.read_status ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-indigo-950/30 border-indigo-500/30 text-slate-200'
                      }`}
                    >
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-[11px] mt-0.5 text-slate-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Pill */}
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-800 border border-slate-700 text-indigo-400 uppercase tracking-wider">
          {user?.role?.replace('_', ' ')}
        </span>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
};
