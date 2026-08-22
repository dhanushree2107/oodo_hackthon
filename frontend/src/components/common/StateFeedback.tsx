import React from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => (
  <div className="p-6 space-y-4 animate-pulse">
    <div className="h-8 bg-slate-800/80 rounded-xl w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="h-28 bg-slate-800/50 rounded-2xl"></div>
      <div className="h-28 bg-slate-800/50 rounded-2xl"></div>
      <div className="h-28 bg-slate-800/50 rounded-2xl"></div>
      <div className="h-28 bg-slate-800/50 rounded-2xl"></div>
    </div>
    <div className="h-64 bg-slate-800/40 rounded-2xl"></div>
  </div>
);

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "Unable to load workforce data.", 
  onRetry 
}) => (
  <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl max-w-lg mx-auto my-8">
    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h3 className="text-base font-bold text-white">Data Connection Issue</h3>
    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry Loading</span>
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "There are currently no items to display."
}) => (
  <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
    <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
    <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
    <p className="text-xs text-slate-500 mt-1">{description}</p>
  </div>
);
