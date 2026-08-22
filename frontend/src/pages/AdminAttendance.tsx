import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';
import { api } from '../api/client';

export const AdminAttendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const [attRes, anomalyRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/attendance/anomalies'),
      ]);
      setRecords(attRes.data);
      setAnomalies(anomalyRes.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Workforce Attendance Matrix & Anomalies</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time shift logs and AI statistical anomaly detection engine.</p>
      </div>

      {/* AI Attendance Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider">AI Attendance Intelligence Flags</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{anom.employee_name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                    Risk Score: {anom.risk_score}/100
                  </span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                  {anom.reasons.map((r: string, rIdx: number) => (
                    <li key={rIdx}>{r}</li>
                  ))}
                </ul>
                <p className="text-[11px] font-semibold text-indigo-400 border-t border-slate-800 pt-2">
                  Action: {anom.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Attendance Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">All Workforce Shift Records</h3>
          <span className="text-xs font-semibold text-slate-500">{records.length} Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Overtime</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-bold text-white">{r.employee_name}</td>
                  <td className="px-6 py-4 font-mono">{r.date}</td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono">{(r.total_working_minutes / 60).toFixed(1)} hrs</td>
                  <td className="px-6 py-4 font-mono text-cyan-400">{r.overtime_minutes} mins</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                      r.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      r.status === 'LATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
