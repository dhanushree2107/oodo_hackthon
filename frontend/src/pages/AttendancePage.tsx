import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Play, 
  Square,
  Building2
} from 'lucide-react';
import { attendanceAPI } from '../lib/api';
import { Attendance } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/common/StateFeedback';
import { formatDate } from '../lib/utils';

export const AttendancePage: React.FC = () => {
  const { auth } = useAuth();
  const isHR = auth.role === 'hr_admin';

  const [logs, setLogs] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceAPI.getAttendanceLogs();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    setActionMsg(null);
    try {
      await attendanceAPI.checkIn('Main Office');
      setActionMsg('Check-in recorded successfully!');
      fetchAttendance();
    } catch (err: any) {
      setActionMsg(err.response?.data?.detail || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setActionMsg(null);
    try {
      await attendanceAPI.checkOut();
      setActionMsg('Check-out recorded successfully!');
      fetchAttendance();
    } catch (err: any) {
      setActionMsg(err.response?.data?.detail || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter logs based on search and status
  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const term = search.toLowerCase();
    const matchesSearch = 
      !search ||
      (log.employee_name && log.employee_name.toLowerCase().includes(term)) ||
      (log.employee_code && log.employee_code.toLowerCase().includes(term)) ||
      (log.department && log.department.toLowerCase().includes(term)) ||
      log.date.includes(term);

    return matchesStatus && matchesSearch;
  });

  // Calculate summary statistics
  const totalCount = logs.length;
  const presentCount = logs.filter(l => l.status === 'present').length;
  const lateCount = logs.filter(l => l.status === 'late').length;
  const absentCount = logs.filter(l => l.status === 'absent').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Clock className="w-6 h-6 text-indigo-400" />
            <span>Workforce Attendance Audit</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isHR 
              ? 'Complete enterprise log records of check-ins, check-outs, and punctuality metrics.' 
              : 'Your personal attendance history and daily time tracking logs.'}
          </p>
        </div>

        {/* Employee Interactive Punch-in Button */}
        {!isHR && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Punch In</span>
            </button>
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Punch Out</span>
            </button>
          </div>
        )}
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Log Entries</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Present</p>
            <p className="text-xl font-extrabold text-emerald-300 mt-0.5">{presentCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Late Arrivals</p>
            <p className="text-xl font-extrabold text-amber-300 mt-0.5">{lateCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Absences</p>
            <p className="text-xl font-extrabold text-rose-300 mt-0.5">{absentCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, ID, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAttendance} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState title="No attendance logs found" description="No attendance records match your current search or filter criteria." />
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Employee</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Check In</th>
                  <th className="py-3.5 px-5">Check Out</th>
                  <th className="py-3.5 px-5">Hours</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{formatDate(log.date)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div>
                        <p className="font-bold text-white">{log.employee_name || `Employee #${log.employee_id}`}</p>
                        <p className="text-[10px] font-mono text-indigo-400">{log.employee_code || `EMP-${log.employee_id}`}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.department || 'General'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono">{log.check_in || '--:--'}</td>
                    <td className="py-3.5 px-5 font-mono">{log.check_out || '--:--'}</td>
                    <td className="py-3.5 px-5 font-mono font-semibold">{log.hours_worked} hrs</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize border ${
                        log.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        log.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
