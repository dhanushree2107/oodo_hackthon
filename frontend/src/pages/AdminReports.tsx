import React from 'react';
import { FileSpreadsheet, Download, Users, Clock, CalendarDays, CircleDollarSign } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const handleExport = (reportType: string) => {
    const token = localStorage.getItem('dayflow_token');
    window.open(`http://localhost:8000/api/analytics/reports/export-csv?report_type=${reportType}&token=${token}`, '_blank');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">HR Data Exporter & Custom Reports</h1>
        <p className="text-xs text-slate-400 mt-1">Generate and export database data records into standard CSV audit format.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Employee Roster Report</h3>
              <p className="text-[11px] text-slate-400">Complete workforce directory with roles, departments, base salary & status.</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('employees')}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Employee CSV
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Attendance Shift Report</h3>
              <p className="text-[11px] text-slate-400">Detailed shift logs, check-in timestamps, working minutes & status.</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('attendance')}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs shadow-lg shadow-cyan-600/25 transition flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Attendance CSV
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Leave Application Audit Report</h3>
              <p className="text-[11px] text-slate-400">Full audit log of leave applications, approved days, and reasons.</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('leaves')}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Leaves CSV
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payroll Summary Report</h3>
              <p className="text-[11px] text-slate-400">Monthly net disbursed salary totals, allowances and tax breakdown.</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('payroll')}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Payroll CSV
          </button>
        </div>
      </div>
    </div>
  );
};
