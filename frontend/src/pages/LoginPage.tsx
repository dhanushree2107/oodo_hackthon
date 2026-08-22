import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<'hr_admin' | 'employee'>('hr_admin');
  const [email, setEmail] = useState('admin@dayflow.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  const handleForgot = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotMsg("Password reset link dispatched to registered work email.");
    setTimeout(() => setForgotMsg(null), 4000);
  };
  const [loading, setLoading] = useState(false);

  const handleRoleSwitch = (selectedRole: 'hr_admin' | 'employee') => {
    setRole(selectedRole);
    if (selectedRole === 'hr_admin') {
      setEmail('admin@dayflow.com');
      setPassword('admin123');
    } else {
      setEmail('john.doe@dayflow.com');
      setPassword('employee123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login({ email: email.trim(), password });
      const targetRole = data?.role || role;
      if (targetRole === 'hr_admin') {
        navigate('/hr/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      if (!err.response) {
        setError('Cannot connect to backend server. Please ensure the backend server is running at http://127.0.0.1:8000.');
      } else if (typeof err.response?.data?.detail === 'string') {
        setError(err.response.data.detail);
      } else if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail.map((d: any) => d.msg || d.detail || JSON.stringify(d)).join(', '));
      } else {
        setError('Invalid email or password credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-navy-950 text-slate-100">
      {/* LEFT SIDE: Brand & Visualization */}
      <div className="lg:col-span-6 bg-gradient-to-br from-navy-950 via-navy-900 to-indigo-950 p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden border-r border-slate-800/80">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Brand Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center space-x-1.5">
                <span>DAYFLOW</span>
                <span className="text-xs uppercase tracking-wider text-indigo-400 font-mono font-bold bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">ENTERPRISE</span>
              </h2>
              <p className="text-xs text-indigo-300 font-medium">"Every workday, perfectly aligned."</p>
            </div>
          </div>

          <div className="mt-12">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Intelligent workforce operations with proactive HR insights.
            </h1>
            <p className="mt-4 text-sm text-slate-300 max-w-lg leading-relaxed">
              Transform standard HR attendance and leave data into explainable early-warning signals, preventing operational bottlenecks before they impact productivity.
            </p>
          </div>

          {/* Workflow Visualization */}
          <div className="mt-10 p-5 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE DAYFLOW WORKFORCE VALUE CHAIN</span>
            </p>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
                <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-white">Attendance</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Logs & Patterns</p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
                <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-indigo-200">Workforce Signals</p>
                <p className="text-[10px] text-indigo-300 mt-0.5">AI Early Warnings</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
                <UserCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-white">HR Action</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Decision Support</p>
              </div>
            </div>
          </div>

          {/* Highlights Checklist */}
          <div className="mt-8 space-y-3">
            {[
              'Workforce Intelligence & Anomaly Engine',
              'Automated HR Decision Support Workflows',
              'Role-Based Enterprise Security & Privacy'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs text-slate-200 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-xs text-slate-500 border-t border-slate-800/60 pt-4 flex items-center justify-between">
          <span>© 2026 Dayflow Enterprise Inc.</span>
          <span className="flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>256-Bit SSL Encrypted</span>
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Card Form */}
      <div className="lg:col-span-6 p-8 lg:p-14 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in to your Dayflow workspace.</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleRoleSwitch('hr_admin')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'hr_admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HR / Admin
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('employee')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'employee'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Employee
            </button>
          </div>

          {forgotMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{forgotMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <a href="#forgot" onClick={handleForgot} className="text-xs text-indigo-400 hover:underline">Forgot Password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-2">
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-wider mb-2 font-mono">Quick Demo One-Click Sign In</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setRole('hr_admin'); setEmail('admin@dayflow.com'); setPassword('admin123'); }}
                className="py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-medium text-indigo-300 border border-slate-700/60"
              >
                ⚡ HR Demo Admin
              </button>
              <button
                type="button"
                onClick={() => { setRole('employee'); setEmail('john.doe@dayflow.com'); setPassword('employee123'); }}
                className="py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] font-medium text-emerald-300 border border-slate-700/60"
              >
                👤 Employee Demo
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-indigo-400 font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
