import React, { useState, useEffect } from 'react';
import { History, Filter, Terminal } from 'lucide-react';
import { api } from '../api/client';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Immutable System Audit Trails</h1>
        <p className="text-xs text-slate-400 mt-1">Complete compliance audit logging of sensitive workforce operations.</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Activity Trail</h3>
          <span className="text-xs font-semibold text-slate-500">{logs.length} Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Actor / User</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Resource</th>
                <th className="px-6 py-3">IP Address</th>
                <th className="px-6 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-mono text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-white">{l.user_name}</td>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">{l.action}</td>
                  <td className="px-6 py-4 text-slate-300">{l.resource_type} ({l.resource_id ? l.resource_id.substring(0, 8) : 'N/A'})</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{l.ip_address || '127.0.0.1'}</td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">{l.metadata_json || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
