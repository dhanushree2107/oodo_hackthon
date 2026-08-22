import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Plus, Download, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export const AdminPayroll: React.FC = () => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [baseSalary, setBaseSalary] = useState('85000');
  const [allowance, setAllowance] = useState('1200');
  const [deduction, setDeduction] = useState('450');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const [pRes, empRes] = await Promise.all([
        api.get('/payroll/admin'),
        api.get('/employees'),
      ]);
      setPayrolls(pRes.data);
      setEmployees(empRes.data);
      if (empRes.data.length > 0) {
        setEmployeeId(empRes.data[0].id);
        setBaseSalary(empRes.data[0].base_salary?.toString() || '85000');
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payroll/create', {
        employee_id: employeeId,
        month: Number(month),
        year: Number(year),
        base_salary: parseFloat(baseSalary),
        items: [
          { item_type: 'ALLOWANCE', category: 'Housing & Transport', amount: parseFloat(allowance) },
          { item_type: 'DEDUCTION', category: 'Tax & Insurance', amount: parseFloat(deduction) },
        ],
      });
      setShowCreateModal(false);
      fetchPayrollData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to process payroll.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = (payrollId: string) => {
    const token = localStorage.getItem('dayflow_token');
    window.open(`http://localhost:8000/api/payroll/${payrollId}/salary-slip/pdf?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Payroll Engine & Salary Slip Generator</h1>
          <p className="text-xs text-slate-400 mt-1">Configure compensation structures and issue computer-generated PDF payslips.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-lg shadow-indigo-500/25 transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          PROCESS PAYROLL RECORD
        </button>
      </div>

      {/* Payroll Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Processed Organization Payroll Records</h3>
          <span className="text-xs font-semibold text-slate-500">{payrolls.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
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
                  <td className="px-6 py-4 font-bold text-white">
                    <div>
                      <p>{p.employee_name}</p>
                      <p className="text-[11px] font-mono text-indigo-400 font-normal">{p.employee_code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{p.department_name}</td>
                  <td className="px-6 py-4 font-mono font-semibold">{p.month}/{p.year}</td>
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
                      Payslip PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payroll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white">Process Salary Record</h2>

            <form onSubmit={handleCreatePayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Employee</label>
                <select
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    const selected = employees.find((emp) => emp.id === e.target.value);
                    if (selected) setBaseSalary(selected.base_salary?.toString() || '85000');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Month (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Base Salary ($)</label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Allowances ($)</label>
                  <input
                    type="number"
                    value={allowance}
                    onChange={(e) => setAllowance(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Deductions ($)</label>
                  <input
                    type="number"
                    value={deduction}
                    onChange={(e) => setDeduction(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25"
                >
                  {submitting ? 'Processing...' : 'Process Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
