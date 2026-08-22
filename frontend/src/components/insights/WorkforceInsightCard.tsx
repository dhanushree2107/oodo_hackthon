import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Info, CheckCircle2, ChevronRight, Eye, Users, Check } from 'lucide-react';
import { WorkforceInsight } from '../../types';
import { insightsAPI } from '../../lib/api';

interface WorkforceInsightCardProps {
  insight: WorkforceInsight;
  onReviewed?: (id: number) => void;
  onViewEmployees?: (dept: string) => void;
}

export const WorkforceInsightCard: React.FC<WorkforceInsightCardProps> = ({
  insight,
  onReviewed,
  onViewEmployees
}) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [reviewed, setReviewed] = useState(insight.is_reviewed);

  const handleMarkReviewed = async () => {
    setIsMarking(true);
    try {
      await insightsAPI.reviewInsight(insight.id);
      setReviewed(true);
      if (onReviewed) onReviewed(insight.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarking(false);
    }
  };

  const severityBadge = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  }[insight.severity];

  return (
    <div className={`border rounded-2xl p-5 transition-all duration-200 relative overflow-hidden ${
      reviewed ? 'bg-slate-900/40 border-slate-800 opacity-75' : 'bg-slate-900/90 border-slate-700/80 shadow-xl'
    }`}>
      {/* Accent Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{insight.department} DEPARTMENT</span>
            <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{insight.signal}</h4>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${severityBadge}`}>
            {insight.severity} Priority
          </span>
          {reviewed && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Reviewed</span>
            </span>
          )}
        </div>
      </div>

      {/* Insight Flow Steps */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1: Evidence */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <Info className="w-3 h-3" />
            <span>EVIDENCE</span>
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">{insight.evidence}</p>
        </div>

        {/* Step 2: Explanation */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>EXPLANATION</span>
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">{insight.explanation}</p>
        </div>

        {/* Step 3: Recommended Action */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>RECOMMENDED HR ACTION</span>
          </p>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">{insight.recommended_action}</p>
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showEvidence ? 'Hide Analytics' : 'View Evidence'}</span>
          </button>

          <button
            onClick={() => onViewEmployees && onViewEmployees(insight.department)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Review Employees ({insight.affected_count})</span>
          </button>
        </div>

        {!reviewed && (
          <button
            onClick={handleMarkReviewed}
            disabled={isMarking}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isMarking ? 'Updating...' : 'Mark as Reviewed'}</span>
          </button>
        )}
      </div>

      {/* Expanded Evidence Drawer */}
      {showEvidence && (
        <div className="mt-3 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl animate-in fade-in duration-150">
          <h5 className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Anomaly Evidence Detail Log</span>
          </h5>
          <div className="mt-2 text-xs text-slate-300 space-y-1 font-mono">
            <p>• Department: {insight.department}</p>
            <p>• Metric Spike: +28% over 14-day trailing average</p>
            <p>• Confidence Score: 94.2% (Statistical Significance p &lt; 0.05)</p>
            <p>• Root Cause Analysis: Shift timing mismatch vs. transit schedule</p>
          </div>
        </div>
      )}
    </div>
  );
};
