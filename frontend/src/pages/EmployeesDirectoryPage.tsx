import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, Phone, MapPin, Building, Calendar, DollarSign, Eye } from 'lucide-react';
import { employeeAPI } from '../lib/api';
import { Employee } from '../types';
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/common/StateFeedback';
import { formatDate, formatCurrency } from '../lib/utils';

export const EmployeesDirectoryPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, [search, department]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeAPI.getEmployees(search, department);
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load employee directory.');
    } finally {
      setLoading(false);
    }
  };

  const departments = ['All', 'Engineering', 'Product', 'Human Resources', 'Sales', 'Marketing'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enterprise Employee Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Search, filter, and inspect workforce personnel records.</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployees} />
      ) : employees.length === 0 ? (
        <EmptyState title="No employees found" description="Try clearing your search or changing the department filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmp(emp)}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 hover:shadow-xl cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3.5">
                <img
                  src={emp.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={emp.full_name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 group-hover:border-indigo-500 transition-colors"
                />
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{emp.full_name}</h3>
                  <p className="text-xs text-slate-400">{emp.job_title}</p>
                  <p className="text-[10px] font-mono text-indigo-400 mt-0.5">{emp.employee_code}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{emp.department}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDate(emp.joining_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Detail Slide-over Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in duration-150 relative">
            <div className="flex items-center space-x-4">
              <img
                src={selectedEmp.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={selectedEmp.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedEmp.full_name}</h3>
                <p className="text-xs text-indigo-400 font-semibold">{selectedEmp.job_title}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedEmp.employee_code}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2.5 text-slate-300">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Department: <strong className="text-white">{selectedEmp.department}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Joined Date: <strong className="text-white">{formatDate(selectedEmp.joining_date)}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Phone: <strong className="text-white">{selectedEmp.phone || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Address: <strong className="text-white">{selectedEmp.address || 'N/A'}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Base Salary: <strong className="text-emerald-400">{formatCurrency(selectedEmp.base_salary)} / yr</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
