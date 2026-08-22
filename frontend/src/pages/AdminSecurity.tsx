import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Key, Laptop, AlertOctagon } from 'lucide-react';
import { api } from '../api/client';

export const AdminSecurity: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [evRes, sessRes] = await Promise.all([
        api.get('/security/events'),
        api.get('/security/active-sessions'),
      ]);
      setEvents(evRes.data);
      setSessions(sessRes.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Admin Security & Access Center</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time tracking of security alerts, active user sessions, and failed login attempts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Alerts Timeline */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            Security Alerts & Events ({events.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No suspicious security events flagged.</p>
            ) : (
              events.map((e) => (
                <div key={e.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{e.event_type}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {e.severity}
                    </span>
                  </div>
                  <p className="text-slate-300">{e.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>IP: {e.ip_address}</span>
                    <span>{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Sessions List */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Laptop className="h-4 w-4 text-cyan-400" />
            Active Session Connections ({sessions.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sessions.map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 truncate max-w-[200px]">{s.device_info || 'Browser Session'}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>IP: {s.ip_address}</span>
                  <span>Active: {new Date(s.last_active).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
