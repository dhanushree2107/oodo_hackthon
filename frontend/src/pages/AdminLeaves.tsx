import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '../api/client';

export const AdminLeaves: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    fetchAdminLeaves();
  }, []);

  const fetchAdminLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves/admin');
      setLeaveRequests(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !actionType) return;

    try {
      if (actionType === 'approve') {
        await api.post(`/leaves/${selectedReq.id}/approve`, { remarks });
      } else {
        await api.post(`/leaves/${selectedReq.id}/reject`, { remarks });
      }
      setSelectedReq(null);
      setActionType(null);
      setRemarks('');
      fetchAdminLeaves();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Action failed.');
    }
  };

  const pendingList = leaveRequests.filter((r) => r.status === 'PENDING');
  const historyList = leaveRequests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Leave Approvals & Workflow Queue</h1>
        <p className="text-xs text-slate-400 mt-1">Review leave applications with automated balance check & notification dispatch.</p>
      </div>

      {/* Pending Queue Section */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Pending Approval Queue ({pendingList.length})
        </h3>

        {pendingList.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No pending leave requests requiring action.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((req) => (
              <div key={req.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white">{req.employee_name}</h4>
                    <span className="text-[11px] text-indigo-400 font-semibold">{req.department_name} • {req.leave_type_name}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                    {req.total_days} Days
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <p className="font-mono">{req.start_date} to {req.end_date}</p>
                  <p className="text-[11px] text-slate-400 mt-1 italic">"{req.reason}"</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => { setSelectedReq(req); setActionType('reject'); }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => { setSelectedReq(req); setActionType('approve'); }}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Processed Leave History</h3>
          <span className="text-xs font-semibold text-slate-500">{historyList.length} Processed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3">Days</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {historyList.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-bold text-white">{req.employee_name}</td>
                  <td className="px-6 py-4 text-indigo-400 font-semibold">{req.leave_type_name}</td>
                  <td className="px-6 py-4 font-mono">{req.start_date} - {req.end_date}</td>
                  <td className="px-6 py-4 font-bold">{req.total_days}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                      req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 italic">{req.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white capitalize">
              {actionType} Leave Request - {selectedReq.employee_name}
            </h2>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Manager Remarks / Note</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional decision remarks..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedReq(null); setActionType(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-white text-xs shadow-lg ${
                    actionType === 'approve' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                  }`}
                >
                  Confirm {actionType.toUpperCase()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
