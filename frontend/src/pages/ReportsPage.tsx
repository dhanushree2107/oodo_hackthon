import React from 'react';
import { BarChart3, Download, FileSpreadsheet, PieChart as PieIcon, TrendingUp, Users } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const downloadCSVReport = (reportType: string) => {
    const headers = "Date,Department,Metric,Value,Status\n";
    const sampleData = `2026-08-22,Engineering,Attendance Rate,94%,Optimal\n2026-08-22,Product,Leave Approvals,3,Pending\n2026-08-22,Sales,Checkout Compliance,88%,Warning\n`;
    const blob = new Blob([headers + sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dayflow_${reportType}_Report.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Workforce Analytics & Export Reports</h1>
        <p className="text-xs text-slate-400 mt-1">Generate and download operational reports for HR audit compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report 1: Attendance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Attendance & Punctuality Audit</h3>
            <p className="text-xs text-slate-400 mt-1">Check-in logs, late arrival percentages, and missing check-outs across teams.</p>
          </div>

          <button
            onClick={() => downloadCSVReport('Attendance_Audit')}
            className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Report 2: Leave */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4">
              <PieIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Leave Allocation & Absence Trends</h3>
            <p className="text-xs text-slate-400 mt-1">Approved time-off logs, sick leave utilization rates, and pending approval queues.</p>
          </div>

          <button
            onClick={() => downloadCSVReport('Leave_Summary')}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Report 3: Payroll */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Payroll & Tax Reconciliation</h3>
            <p className="text-xs text-slate-400 mt-1">Monthly net take-home salary distribution, allowances, and tax deduction breakdowns.</p>
          </div>

          <button
            onClick={() => downloadCSVReport('Payroll_Reconciliation')}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
