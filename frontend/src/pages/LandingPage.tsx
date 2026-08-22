import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Calendar,
  CircleDollarSign,
  Brain,
  Bot,
  ArrowRight,
  CheckCircle2,
  Users,
  Lock,
  Zap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0B0F17]/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white">DAYFLOW</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Next-Generation HR Operating System
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
          DAYFLOW
        </h1>
        <p className="mt-4 text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
          Every workday, perfectly aligned.
        </p>

        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          An intelligent HR operating system connecting workforce management, smart attendance, automated leave workflows, payroll visibility, secure documents, and AI copilot in one platform.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3.5 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 transition flex items-center gap-2"
          >
            Launch Dayflow Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 text-base font-bold rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            Explore Live Demo Account
          </Link>
        </div>

        {/* Live Workflow Visualization */}
        <div className="mt-16 w-full max-w-4xl p-6 rounded-2xl glass-panel text-left">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">
            INTELLIGENT WORKFORCE PIPELINE
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <Users className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">Employee Identity</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <Clock className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">Smart Attendance</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <Brain className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">AI Intelligence</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">HR Decisioning</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 md:col-span-1">
              <Zap className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">Automated Audit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-8 py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Built for Modern High-Growth Enterprise Teams</h2>
            <p className="text-slate-400 mt-2 text-sm">Everything your HR managers and employees need to perform at their peak.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition">
              <Bot className="h-8 w-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">AI HR Copilot</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Permission-aware assistant that answers questions on leave balance, attendance trends, and payroll slips via secure database function calling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition">
              <Clock className="h-8 w-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Smart Attendance</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Check-in and check-out tracking with statistical anomaly detection for frequent late arrivals, short shifts, and absenteeism.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition">
              <Calendar className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Transactional Leave</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Automatic day computations, balance deductions, overlap validation, and instant employee notifications on approval.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition">
              <CircleDollarSign className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Payroll & PDF Payslips</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Transparent salary breakdown with allowances, tax deductions, net pay calculation, and computer-generated PDF salary slip downloads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition">
              <Lock className="h-8 w-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Enterprise Security & RBAC</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Argon2/PBKDF2 password hashing, JWT refresh token rotation, Security Center monitoring, and immutable audit logging.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition">
              <Brain className="h-8 w-8 text-rose-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Workforce Analytics</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Real-time SQL aggregation dashboards, attendance trends, department distribution charts, and exportable CSV reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-8 py-8 text-center text-xs text-slate-500">
        <p>© 2026 DAYFLOW HR Operating System. Designed for modern enterprise teams.</p>
      </footer>
    </div>
  );
};
