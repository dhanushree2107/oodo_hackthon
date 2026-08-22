import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Download, ShieldCheck } from 'lucide-react';
import { payrollAPI } from '../lib/api';
import { Payroll } from '../types';
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/common/StateFeedback';
import { formatCurrency } from '../lib/utils';

export const PayrollPage: React.FC = () => {
  const [payrollList, setPayrollList] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const data = await payrollAPI.getPayrollRecords();
      setPayrollList(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load payroll summary.');
    } finally {
      setLoading(false);
    }
  };

  const exportPayrollCSV = () => {
    if (!payrollList.length) return;
    const headers = "Employee,Pay Period,Basic Salary,Allowances,Deductions,Net Salary,Status\n";
    const rows = payrollList.map(p => 
      `"${p.employee_name}","${p.pay_period}",${p.basic_salary},${p.allowances},${p.deductions},${p.net_salary},"${p.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dayflow_Payroll_Statement_Aug2026.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enterprise Payroll & Paystubs</h1>
          <p className="text-xs text-slate-400 mt-1">Salary structures, allowances, tax deductions, and net payouts.</p>
        </div>

        <button 
          onClick={exportPayrollCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Payroll Statement</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPayroll} />
      ) : payrollList.length === 0 ? (
        <EmptyState title="No payroll records found" description="Payroll summaries will be posted at month end." />
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Basic Salary</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {payrollList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-white">{p.employee_name}</td>
                  <td className="py-3 px-4 text-slate-300">{p.pay_period}</td>
                  <td className="py-3 px-4">{formatCurrency(p.basic_salary)}</td>
                  <td className="py-3 px-4 text-emerald-400">+{formatCurrency(p.allowances)}</td>
                  <td className="py-3 px-4 text-rose-400">-{formatCurrency(p.deductions)}</td>
                  <td className="py-3 px-4 font-extrabold text-white">{formatCurrency(p.net_salary)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
