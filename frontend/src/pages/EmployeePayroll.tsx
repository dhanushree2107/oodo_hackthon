import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Download, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export const EmployeePayroll: React.FC = () => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll/me');
      setPayrolls(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = (payrollId: string) => {
    const token = localStorage.getItem('dayflow_token');
    window.open(`http://localhost:8000/api/payroll/${payrollId}/salary-slip/pdf?token=${token}`, '_blank');
  };

  const latest = payrolls[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Payroll & Salary Slips</h1>
        <p className="text-xs text-slate-400 mt-1">Read-only view of processed pay slips and official PDF downloads.</p>
      </div>

      {/* Latest Net Pay Summary */}
      {latest && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Net Salary</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">${latest.net_salary.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">Pay Period: {latest.month}/{latest.year}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Base Salary</span>
            <p className="text-base font-bold text-slate-200">${latest.base_salary.toLocaleString()}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Allowances / Deductions</span>
            <p className="text-xs font-bold text-cyan-400">+${latest.total_allowances} / -${latest.total_deductions}</p>
          </div>

          <div className="flex justify-start md:justify-end">
            <button
              onClick={() => handleDownloadPdf(latest.id)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF Payslip
            </button>
          </div>
        </div>
      )}

      {/* Payroll History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Historical Pay Records</h3>
          <span className="text-xs font-semibold text-slate-500">{payrolls.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Base Salary</th>
                <th className="px-6 py-3">Allowances</th>
                <th className="px-6 py-3">Deductions</th>
                <th className="px-6 py-3">Net Disbursed</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {payrolls.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-bold text-white">{p.month}/{p.year}</td>
                  <td className="px-6 py-4 font-mono">${p.base_salary.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-emerald-400">+${p.total_allowances}</td>
                  <td className="px-6 py-4 font-mono text-rose-400">-${p.total_deductions}</td>
                  <td className="px-6 py-4 font-bold font-mono text-emerald-400 text-sm">${p.net_salary.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDownloadPdf(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF Payslip
                    </button>
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
