import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Play, 
  Square, 
  Plus, 
  Send, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI, leaveAPI } from '../lib/api';
import { EmployeeDashboardData } from '../types';
import { LoadingSkeleton, ErrorState } from '../components/common/StateFeedback';
import { formatDate, formatCurrency } from '../lib/utils';

export const EmployeeDashboardPage: React.FC = () => {
  const { auth } = useAuth();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check-in / Check-out interactive state
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Apply Leave Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardAPI.getEmployeeDashboard();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load employee workspace data.');
    } finally {
      setLoading(false);
    }
  };

  // Action Feedback state
  const [actionError, setActionError] = useState<string | null>(null);
  const [leaveErrorMsg, setLeaveErrorMsg] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    setActionError(null);
    try {
      await attendanceAPI.checkIn("Main Office HQ");
      fetchDashboard();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Check-in failed. Please try again.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    setActionError(null);
    try {
      await attendanceAPI.checkOut();
      fetchDashboard();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Check-out failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    setIsSubmittingLeave(true);
    setLeaveErrorMsg(null);
    try {
      await leaveAPI.applyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason
      });
      setLeaveSuccessMsg('Leave request submitted successfully!');
      setTimeout(() => {
        setShowLeaveModal(false);
        setLeaveSuccessMsg(null);
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchDashboard();
      }, 1200);
    } catch (err: any) {
      setLeaveErrorMsg(err.response?.data?.detail || "Failed to submit leave request.");
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error || !data) return <ErrorState message={error || undefined} onRetry={fetchDashboard} />;

  const todayAtt = data.today_attendance;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Employee Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={data.employee.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt={data.employee.full_name}
            className="w-14 h-14 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Good morning, {data.employee.full_name} 👋
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.employee.job_title} • <span className="text-indigo-400 font-medium">{data.employee.department}</span> • ID: <span className="font-mono text-slate-300">{data.employee.employee_code}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLeaveModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Main Grid: Attendance Widget + Leave Balance + Paystub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Attendance Widget */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Today's Workday Attendance</span>
              </h3>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                todayAtt?.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                todayAtt?.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {todayAtt ? todayAtt.status : 'Not Checked In'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Check In Time</p>
                <p className="text-lg font-extrabold text-white mt-1">
                  {todayAtt?.check_in || '--:--'}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Check Out Time</p>
                <p className="text-lg font-extrabold text-white mt-1">
                  {todayAtt?.check_out || '--:--'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Check In / Out Action Buttons */}
          <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-800">
            {!todayAtt?.check_in ? (
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isCheckingIn ? 'Processing...' : 'Check In Now'}</span>
              </button>
            ) : !todayAtt?.check_out ? (
              <button
                onClick={handleCheckOut}
                disabled={isCheckingOut}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>{isCheckingOut ? 'Processing...' : 'Check Out Now'}</span>
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-center text-xs font-semibold flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Workday Attendance Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Leave Balances Card */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Leave Allocation & Balances</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Remaining paid annual days</p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] font-bold text-indigo-400 uppercase">Paid Leave</p>
                <p className="text-2xl font-extrabold text-white mt-1">{data.leave_balances.paid}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Days left</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] font-bold text-amber-400 uppercase">Sick Leave</p>
                <p className="text-2xl font-extrabold text-white mt-1">{data.leave_balances.sick}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Days left</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Unpaid</p>
                <p className="text-2xl font-extrabold text-white mt-1">{data.leave_balances.unpaid}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Days left</p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-800">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Request Time Off
            </button>
          </div>
        </div>
      </div>

      {/* Payroll Summary & Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payroll Summary View */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Payroll & Salary Overview</span>
            </h3>
            <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
              {data.latest_payroll?.status || 'Paid'}
            </span>
          </div>

          {data.latest_payroll ? (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Pay Period</span>
                <span className="text-white font-semibold">{data.latest_payroll.pay_period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Basic Salary</span>
                <span className="text-slate-200">{formatCurrency(data.latest_payroll.basic_salary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allowances</span>
                <span className="text-emerald-400">+{formatCurrency(data.latest_payroll.allowances)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deductions</span>
                <span className="text-rose-400">-{formatCurrency(data.latest_payroll.deductions)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                <span className="text-white">Net Take-Home Pay</span>
                <span className="text-emerald-400">{formatCurrency(data.latest_payroll.net_salary)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No paystub record available.</p>
          )}
        </div>

        {/* Leave Requests Status Table */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>My Leave Applications</span>
            <span className="text-xs text-slate-400">{data.pending_requests.length} records</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">HR Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {data.pending_requests.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 capitalize font-semibold text-indigo-400">{leave.leave_type}</td>
                    <td className="py-2.5 px-3 text-slate-300">{formatDate(leave.start_date)} - {formatDate(leave.end_date)}</td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{leave.reason}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                        leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] italic max-w-xs truncate">
                      {leave.approver_comment ? `"${leave.approver_comment}"` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-white">Apply for Time Off</h3>

            {leaveSuccessMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl text-center">
                {leaveSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
                {leaveErrorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-xl">
                    {leaveErrorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="paid">Paid Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reason for Leave</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Brief description of reason..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-3">
                  <button
                    type="submit"
                    disabled={isSubmittingLeave}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingLeave ? 'Submitting...' : 'Submit Application'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
