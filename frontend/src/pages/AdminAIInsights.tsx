import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertCircle, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';

export const AdminAIInsights: React.FC = () => {
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyBrief();
  }, []);

  const fetchDailyBrief = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/daily-brief');
      setBrief(res.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          Dayflow AI Workforce Intelligence
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
            EXPLAINABLE AI
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Daily AI workforce executive summary generated from live SQL metrics.</p>
      </div>

      {/* Today's Workforce Brief Card */}
      <div className="glass-panel p-8 rounded-2xl border border-indigo-500/30 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{brief?.title || "Today's Workforce Brief"}</h2>
              <p className="text-xs text-slate-400">Automated morning HR briefing report</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold border border-indigo-500/20">
            CONFIDENCE: 98%
          </span>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Headcount</span>
            <p className="text-xl font-extrabold text-white">{brief?.metrics?.total_workforce || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Present</span>
            <p className="text-xl font-extrabold text-emerald-400">{brief?.metrics?.active_present || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Late Arrivals</span>
            <p className="text-xl font-extrabold text-amber-400">{brief?.metrics?.late_arrivals || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Review</span>
            <p className="text-xl font-extrabold text-purple-400">{brief?.metrics?.pending_approvals || 0}</p>
          </div>
        </div>

        {/* AI Key Highlights */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Operational Highlights</h4>
          <div className="space-y-2">
            {brief?.highlights?.map((h: string, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recommended Advisory Actions</h4>
          <div className="space-y-2">
            {brief?.recommendations?.map((r: string, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
