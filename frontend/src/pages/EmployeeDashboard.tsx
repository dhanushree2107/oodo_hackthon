import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CircleDollarSign,
  Bot,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAtt, setTodayAtt] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [attRes, leaveRes, payRes] = await Promise.all([
        api.get('/attendance/me'),
        api.get('/leaves/balances'),
        api.get('/payroll/me'),
      ]);
      setAttendance(attRes.data);
      setLeaveBalances(leaveRes.data);
      setPayroll(payRes.data);

      const todayStr = new Date().toISOString().split('T')[0];
      const foundToday = attRes.data.find((a: any) => a.date === todayStr);
      setTodayAtt(foundToday || null);
    } catch (err) {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/attendance/check-in', { source: 'WEB_APP' });
      setTodayAtt(res.data);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.post('/attendance/check-out');
      setTodayAtt(res.data);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Check-out failed');
    }
  };

  const totalLeaveAvailable = leaveBalances.reduce((acc, curr) => acc + (curr.available_days || 0), 0);
  const latestPay = payroll[0];

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Good morning, {user?.full_name} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Check-In / Check-Out Controls */}
        <div className="flex items-center gap-3">
          {!todayAtt || !todayAtt.check_in_time ? (
            <button
              onClick={handleCheckIn}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              CHECK IN NOW
            </button>
          ) : !todayAtt.check_out_time ? (
            <button
              onClick={handleCheckOut}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs shadow-lg shadow-amber-600/20 transition flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              CHECK OUT NOW
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Shift Completed ({todayAtt.total_working_minutes} mins)
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</span>
            <Clock className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-xl font-extrabold text-white">
            {todayAtt?.status || 'NOT CHECKED IN'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {todayAtt?.check_in_time ? `In: ${new Date(todayAtt.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No record yet'}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Balance</span>
            <Calendar className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{totalLeaveAvailable} Days</p>
          <p className="text-[11px] text-purple-400 mt-1">Across all leave types</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Monthly Pay</span>
            <CircleDollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-white">
            {latestPay ? `$${latestPay.net_salary.toLocaleString()}` : '$0.00'}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">{latestPay ? `Period: ${latestPay.month}/${latestPay.year}` : 'Pending calculation'}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Copilot</span>
            <Bot className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-slate-200">HR Assistant Active</p>
          <Link to="/employee/ai-copilot" className="text-[11px] text-cyan-400 hover:underline mt-2 inline-block font-semibold">
            Ask Copilot →
          </Link>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Action Buttons */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
          <Link
            to="/employee/leave"
            className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200 transition"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Apply for Leave</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
          </Link>

          <Link
            to="/employee/payroll"
            className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200 transition"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Download Salary Slip</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
          </Link>

          <Link
            to="/employee/ai-copilot"
            className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200 transition"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-400" />
              <span>Open AI HR Assistant</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500" />
          </Link>
        </div>

        {/* Recent Attendance Log */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Attendance Stream</h3>
            <Link to="/employee/attendance" className="text-xs text-indigo-400 hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {attendance.slice(0, 4).map((att) => (
              <div key={att.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-200">{att.date}</p>
                  <p className="text-[11px] text-slate-400">
                    In: {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} • Out: {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${
                  att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  att.status === 'LATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
