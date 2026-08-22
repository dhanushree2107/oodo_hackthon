import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Mail, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { leaveAPI } from '../lib/api';
import { LeaveRequest } from '../types';
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/common/StateFeedback';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const LeaveManagementPage: React.FC = () => {
  const { auth } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Approve / Reject
  const [reviewModal, setReviewModal] = useState<{
    leave: LeaveRequest;
    action: 'approve' | 'reject';
  } | null>(null);

  const [hrComment, setHrComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Feedback Alert Banner State
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'warning' | 'danger';
    message: string;
    emailSent?: boolean;
    emailError?: string;
  } | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveAPI.getLeaveRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load leave management records.');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (leave: LeaveRequest, action: 'approve' | 'reject') => {
    setReviewModal({ leave, action });
    setHrComment(action === 'approve' ? 'Approved. Have a good break.' : '');
    setFeedbackBanner(null);
  };

  const handleConfirmReview = async () => {
    if (!reviewModal) return;
    const { leave, action } = reviewModal;
    setSubmitting(true);
    try {
      let response: LeaveRequest;
      if (action === 'approve') {
        response = await leaveAPI.approveLeave(leave.id, { comment: hrComment });
      } else {
        response = await leaveAPI.rejectLeave(leave.id, { comment: hrComment });
      }

      setReviewModal(null);
      setHrComment('');

      // Show real email status feedback toast/banner
      const isApproved = action === 'approve';
      const actionText = isApproved ? 'approved' : 'rejected';

      if (response.email_sent) {
        setFeedbackBanner({
          type: 'success',
          message: `Leave ${actionText} successfully. Email notification sent to employee (${response.employee_email || 'inbox'}).`,
          emailSent: true
        });
      } else {
        setFeedbackBanner({
          type: 'warning',
          message: `Leave ${actionText}, but email delivery failed. (${response.email_error || 'Check email provider configuration in .env'})`,
          emailSent: false,
          emailError: response.email_error
        });
      }

      fetchLeaves();
    } catch (err: any) {
      console.error(err);
      setFeedbackBanner({
        type: 'danger',
        message: err.response?.data?.detail || 'Failed to process leave request.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-indigo-400" />
            <span>Leave Management & Approvals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review leave applications and trigger real transactional email notifications.</p>
        </div>
        <button
          onClick={fetchLeaves}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          Refresh List
        </button>
      </div>

      {/* Real Email Action Feedback Banner */}
      {feedbackBanner && (
        <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 transition-all ${
          feedbackBanner.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          feedbackBanner.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
          'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {feedbackBanner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : feedbackBanner.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold text-sm">{feedbackBanner.message}</p>
            {feedbackBanner.emailSent && (
              <p className="text-[11px] opacity-90 mt-0.5 flex items-center space-x-1 text-emerald-200">
                <Mail className="w-3.5 h-3.5" />
                <span>Real transactional email delivered via backend email service.</span>
              </p>
            )}
            {feedbackBanner.emailSent === false && (
              <p className="text-[11px] opacity-90 mt-0.5 text-amber-200">
                The database status was updated successfully. Please verify <code>RESEND_API_KEY</code> or <code>SMTP</code> settings in <code>backend/.env</code> for email delivery.
              </p>
            )}
          </div>
          <button 
            onClick={() => setFeedbackBanner(null)}
            className="text-slate-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLeaves} />
      ) : requests.length === 0 ? (
        <EmptyState title="No leave applications" description="New leave requests will be shown here." />
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                {auth.role === 'hr_admin' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {requests.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-white">
                    {leave.employee_name || 'Employee'}
                    <span className="block text-[10px] text-slate-400 font-normal">{leave.department}</span>
                  </td>
                  <td className="py-3 px-4 text-indigo-300 font-mono text-[11px]">
                    {leave.employee_email || 'N/A'}
                  </td>
                  <td className="py-3 px-4 capitalize font-semibold text-indigo-400">
                    {leave.leave_type} Leave
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                      leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {leave.status}
                    </span>
                    {leave.approver_comment && (
                      <p className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[140px]" title={leave.approver_comment}>
                        "{leave.approver_comment}"
                      </p>
                    )}
                  </td>
                  {auth.role === 'hr_admin' && (
                    <td className="py-3 px-4 text-right space-x-2">
                      {leave.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => openReviewModal(leave, 'approve')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md transition-colors inline-flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => openReviewModal(leave, 'reject')}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-md transition-colors inline-flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Reviewed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPROVE / REJECT MODAL */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                {reviewModal.action === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Approve Leave Request</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Reject Leave Request</span>
                  </>
                )}
              </h3>
              <button 
                onClick={() => setReviewModal(null)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Leave Details Summary */}
            <div className="bg-slate-950 p-4 rounded-xl text-xs space-y-2 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <strong className="text-white">{reviewModal.leave.employee_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-indigo-300 font-mono">{reviewModal.leave.employee_email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Leave Type:</span>
                <span className="text-indigo-400 font-bold capitalize">{reviewModal.leave.leave_type} Leave</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-slate-200">{formatDate(reviewModal.leave.start_date)} to {formatDate(reviewModal.leave.end_date)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-0.5">Reason:</span>
                <span className="text-slate-300 italic">"{reviewModal.leave.reason}"</span>
              </div>
            </div>

            {/* HR Comment Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>HR Comment / Reason</span>
                <span className="text-[10px] text-slate-500">{reviewModal.action === 'approve' ? '(Optional)' : '(Recommended)'}</span>
              </label>
              <textarea
                value={hrComment}
                onChange={(e) => setHrComment(e.target.value)}
                placeholder={reviewModal.action === 'approve' ? 'Approved. Have a good break.' : 'Please state reason for rejection...'}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Submitting will trigger a REAL email to <strong>{reviewModal.leave.employee_email || 'employee email'}</strong>.</span>
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              {reviewModal.action === 'approve' ? (
                <button
                  onClick={handleConfirmReview}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Approving & Sending Email...' : 'Approve Leave'}</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmReview}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{submitting ? 'Rejecting & Sending Email...' : 'Reject Leave'}</span>
                </button>
              )}

              <button
                onClick={() => setReviewModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
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
