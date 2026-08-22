import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Shield } from 'lucide-react';
import { api } from '../api/client';

export const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Organization Document Repository</h1>
        <p className="text-xs text-slate-400 mt-1">Central vault for policy documents, contracts, and uploaded employee credentials.</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">All Managed File Artifacts</h3>
          <span className="text-xs font-semibold text-slate-500">{documents.length} Files</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Document Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">File Size</th>
                <th className="px-6 py-3">Uploaded Date</th>
                <th className="px-6 py-3">Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    <span>{doc.title}</span>
                  </td>
                  <td className="px-6 py-4 text-indigo-400 font-semibold">{doc.category}</td>
                  <td className="px-6 py-4 font-mono">{(doc.file_size / 1024).toFixed(1)} KB</td>
                  <td className="px-6 py-4 font-mono">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase">
                      Private (Encrypted)
                    </span>
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
