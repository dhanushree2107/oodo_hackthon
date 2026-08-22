import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

export const EmployeeAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAtt, setTodayAtt] = useState<any>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/me');
      setAttendance(res.data);
      const todayStr = new Date().toISOString().split('T')[0];
      const foundToday = res.data.find((a: any) => a.date === todayStr);
      setTodayAtt(foundToday || null);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in', { source: 'WEB_APP' });
      setTodayAtt(res.data);
      fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out');
      setTodayAtt(res.data);
      fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Attendance Console</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time check-in, check-out, working hours, and shift history.</p>
        </div>

        <button
          onClick={fetchAttendance}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Today Console Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Today's Shift Status</h2>
            <p className="text-xs text-slate-400">
              {todayAtt ? `Status: ${todayAtt.status} (${todayAtt.total_working_minutes} mins logged)` : 'No check-in recorded for today'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!todayAtt || !todayAtt.check_in_time ? (
            <button
              onClick={handleCheckIn}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              CHECK IN NOW
            </button>
          ) : !todayAtt.check_out_time ? (
            <button
              onClick={handleCheckOut}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs shadow-lg shadow-amber-600/25 transition flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              CHECK OUT NOW
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Checked Out ({new Date(todayAtt.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </div>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Attendance Log History</h3>
          <span className="text-xs font-semibold text-slate-500">{attendance.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
                <th className="px-6 py-3">Working Hours</th>
                <th className="px-6 py-3">Overtime</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {attendance.map((att) => (
                <tr key={att.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-semibold text-white">{att.date}</td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono">{(att.total_working_minutes / 60).toFixed(1)} hrs</td>
                  <td className="px-6 py-4 font-mono text-cyan-400">{att.overtime_minutes} mins</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                      att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      att.status === 'LATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {att.status}
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
