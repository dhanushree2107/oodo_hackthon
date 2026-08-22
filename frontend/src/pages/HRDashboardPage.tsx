import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

import { useAuth } from '../context/AuthContext';
import { dashboardAPI, leaveAPI } from '../lib/api';
import { HRDashboardData, LeaveRequest } from '../types';
import { StatCard } from '../components/common/StatCard';
import { WorkforceInsightCard } from '../components/insights/WorkforceInsightCard';
import { LoadingSkeleton, ErrorState } from '../components/common/StateFeedback';
import { formatDate } from '../lib/utils';

export const HRDashboardPage: React.FC = () => {
  const { auth } = useAuth();
  const [data, setData] = useState<HRDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Leave approval modal state
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [approverComment, setApproverComment] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardAPI.getHRDashboard();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load HR workforce command center data.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLeave = async (status: 'approved' | 'rejected') => {
    if (!selectedLeave) return;
    setIsSubmittingLeave(true);
    try {
      const commentVal = approverComment || (status === 'approved' ? 'Approved by HR Admin' : 'Declined due to staffing requirements');
      if (status === 'approved') {
        await leaveAPI.approveLeave(selectedLeave.id, { comment: commentVal });
      } else {
        await leaveAPI.rejectLeave(selectedLeave.id, { comment: commentVal });
      }
      setSelectedLeave(null);
      setApproverComment('');
      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error || !data) return <ErrorState message={error || undefined} onRetry={fetchDashboard} />;

  const COLORS = ['#10B981', '#F59E0B', '#F43F5E', '#6366F1'];

  const pieData = [
    { name: 'Present', value: data.attendance_breakdown.present },
    { name: 'Late', value: data.attendance_breakdown.late },
    { name: 'Absent', value: data.attendance_breakdown.absent },
    { name: 'On Leave', value: data.attendance_breakdown.leave },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Good morning, {auth.full_name || 'Alexandra'} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">Here's your workforce intelligence command center overview.</p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live System Engine</span>
          </span>
          <button 
            onClick={fetchDashboard}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Employees"
          value={data.summary.total_employees}
          subtitle="Active enterprise staff"
          icon={Users}
          trend={{ value: '3.2%', isPositive: true }}
          colorScheme="indigo"
        />
        <StatCard
          title="Present Today"
          value={data.summary.present_today}
          subtitle="Logged in & active"
          icon={UserCheck}
          trend={{ value: '94%', isPositive: true }}
          colorScheme="emerald"
        />
        <StatCard
          title="On Leave"
          value={data.summary.on_leave}
          subtitle="Approved absences"
          icon={Calendar}
          colorScheme="slate"
        />
        <StatCard
          title="Pending Approvals"
          value={data.summary.pending_approvals}
          subtitle="Leave requests"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Attendance Risk"
          value={data.summary.attendance_risk}
          subtitle="AI flagged anomalies"
          icon={AlertTriangle}
          colorScheme="rose"
        />
        <StatCard
          title="Payroll Alerts"
          value={data.summary.payroll_alerts}
          subtitle="Audit flags"
          icon={CreditCard}
          colorScheme="indigo"
        />
      </div>

      {/* AI WORKFORCE INTELLIGENCE SECTION (THE MAIN DIFFERENTIATOR) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
                <span>AI Workforce Intelligence</span>
                <span className="bg-indigo-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Early Warnings</span>
              </h2>
              <p className="text-xs text-slate-400">Proactive pattern detection with evidence & recommended HR actions.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {data.insights.map((insight) => (
            <WorkforceInsightCard
              key={insight.id}
              insight={insight}
              onReviewed={() => fetchDashboard()}
            />
          ))}
        </div>
      </div>

      {/* Workforce Health Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Attendance Trend */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Attendance Trend</h3>
              <p className="text-xs text-slate-400">Daily check-in distribution across departments</p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              Current Sprint Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weekly_trend}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="present" fill="#6366F1" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="late" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Late" />
                <Bar dataKey="absent" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workforce Health Breakdown Pie */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Workforce Health Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status distribution</p>

            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Present ({data.attendance_breakdown.present})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">Late ({data.attendance_breakdown.late})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Absent ({data.attendance_breakdown.absent})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-slate-300">Leave ({data.attendance_breakdown.leave})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Pending Leave Approvals</span>
              <span className="bg-amber-500/10 text-amber-400 font-mono text-xs px-2 py-0.5 rounded-md border border-amber-500/20">
                {data.recent_leaves.length} Pending
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Review and approve employee leave applications</p>
          </div>
        </div>

        {data.recent_leaves.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">All leave requests have been reviewed!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {data.recent_leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{leave.employee_name}</td>
                    <td className="py-3 px-4 text-slate-300">{leave.department}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {leave.leave_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{leave.reason}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLeave(leave)}
                        className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Leave Request Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-white">Review Leave Application</h3>
            
            <div className="bg-slate-950 p-4 rounded-xl text-xs space-y-2 border border-slate-800">
              <p><span className="text-slate-400">Applicant:</span> <strong className="text-white">{selectedLeave.employee_name}</strong> ({selectedLeave.department})</p>
              <p><span className="text-slate-400">Leave Type:</span> <strong className="text-indigo-400 capitalize">{selectedLeave.leave_type}</strong></p>
              <p><span className="text-slate-400">Duration:</span> <strong className="text-slate-200">{formatDate(selectedLeave.start_date)} to {formatDate(selectedLeave.end_date)}</strong></p>
              <p><span className="text-slate-400">Reason:</span> <span className="text-slate-300 italic">"{selectedLeave.reason}"</span></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">HR Approver Note / Comment</label>
              <textarea
                value={approverComment}
                onChange={(e) => setApproverComment(e.target.value)}
                placeholder="Optional HR comment..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => handleReviewLeave('approved')}
                disabled={isSubmittingLeave}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Request</span>
              </button>

              <button
                onClick={() => handleReviewLeave('rejected')}
                disabled={isSubmittingLeave}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => setSelectedLeave(null)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
