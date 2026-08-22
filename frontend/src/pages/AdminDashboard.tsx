import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  CircleDollarSign,
  UserPlus,
  CheckSquare,
  BarChart2,
  Brain,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../api/client';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/summary');
      setSummary(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const trendData = [
    { day: 'Mon', present: 38, absent: 2, leave: 4 },
    { day: 'Tue', present: 41, absent: 1, leave: 2 },
    { day: 'Wed', present: 40, absent: 0, leave: 4 },
    { day: 'Thu', present: 39, absent: 2, leave: 3 },
    { day: 'Fri', present: 42, absent: 1, leave: 1 },
  ];

  const COLORS = ['#6366F1', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">HR Executive Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time organization telemetry and workforce intelligence.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/employees"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Link>
          <Link
            to="/admin/leaves"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-xs border border-slate-700 transition flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4 text-purple-400" />
            Leave Queue ({summary?.pending_leave_requests || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Headcount</span>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{summary?.total_employees || 0}</p>
          <p className="text-[11px] text-emerald-400 mt-1">{summary?.active_employees || 0} Active Accounts</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</span>
            <Clock className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{summary?.present_today || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Attendance Rate: {summary?.attendance_rate || 100}%</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">On Leave / Pending</span>
            <CalendarDays className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{summary?.on_leave_today || 0} / {summary?.pending_leave_requests || 0}</p>
          <p className="text-[11px] text-purple-400 mt-1">Approved / Pending</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Payroll</span>
            <CircleDollarSign className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">${(summary?.monthly_payroll_expense || 0).toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Processed Net Disbursed</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 md:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Weekly Workforce Attendance Telemetry</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="present" stroke="#6366F1" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Department Headcount</h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.department_distribution || []}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={40}
                  paddingAngle={4}
                >
                  {(summary?.department_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {(summary?.department_distribution || []).map((d: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{d.department}</span>
                </div>
                <span className="font-bold">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
