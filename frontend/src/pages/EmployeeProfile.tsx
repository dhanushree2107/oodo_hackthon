import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Building, Briefcase, Calendar, DollarSign, Save } from 'lucide-react';
import { api } from '../api/client';

export const EmployeeProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees/me');
      setProfile(res.data);
      setPhone(res.data.phone || '');
      setAddress(res.data.address || '');
      setEmergencyContact(res.data.emergency_contact || '');
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.put(`/employees/${profile.id}`, {
        phone,
        address,
        emergency_contact: emergencyContact,
      });
      setMsg('Profile updated successfully.');
      fetchProfile();
    } catch (err: any) {
      setMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-400 p-6">Loading profile details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">My Employee Profile</h1>
        <p className="text-xs text-slate-400 mt-1">View personal, job, and contact information.</p>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          {msg}
        </div>
      )}

      {/* Header Banner Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
          {profile?.full_name?.charAt(0)}
        </div>
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold text-white">{profile?.full_name}</h2>
          <p className="text-xs text-indigo-400 font-mono">{profile?.employee_code} • {profile?.role?.replace('_', ' ')}</p>
          <p className="text-xs text-slate-400">{profile?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personal & Contact Info</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Update Permitted Info'}
          </button>
        </div>

        {/* Job Details (Read-only for Employee) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job & Salary Structure</h3>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Department</span>
            <p className="text-xs font-bold text-slate-200">{profile?.department?.name || 'General'}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Designation</span>
            <p className="text-xs font-bold text-slate-200">{profile?.designation?.title || 'Staff Member'}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Joining Date</span>
            <p className="text-xs font-bold text-slate-200">{profile?.joining_date}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Employment Status</span>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
              {profile?.employment_status}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Base Salary Structure</span>
            <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
              ${profile?.base_salary ? profile.base_salary.toLocaleString() : '0.00'} / year
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
