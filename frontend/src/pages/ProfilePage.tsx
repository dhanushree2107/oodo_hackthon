import React, { useState } from 'react';
import { User, Phone, MapPin, Building, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { employeeAPI } from '../lib/api';

export const ProfilePage: React.FC = () => {
  const { auth } = useAuth();
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [address, setAddress] = useState('100 Enterprise Way, Suite 400, San Francisco, CA');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.employee_id) return;
    setIsSaving(true);
    try {
      await employeeAPI.updateEmployee(auth.employee_id, { phone, address });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Personnel Profile</h1>
        <p className="text-xs text-slate-400 mt-1">View and update permitted contact details.</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/30">
            {auth.full_name ? auth.full_name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{auth.full_name}</h2>
            <p className="text-xs text-indigo-400 font-semibold">{auth.job_title || 'Enterprise Member'}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {auth.employee_code || 'EMP-0001'}</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Work Email (Read Only)</label>
              <input
                type="text"
                disabled
                value={auth.email || ''}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Department (Read Only)</label>
              <input
                type="text"
                disabled
                value={auth.department || 'Enterprise'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Mobile Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Home Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
