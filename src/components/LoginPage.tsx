import React, { useState } from 'react';
import { 
  Layers, Shield, Lock, Mail, ArrowRight, 
  Eye, EyeOff, AlertCircle, RefreshCw, CheckCircle2,
  TrendingUp, Award, Clock
} from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your corporate email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email.trim(), password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[32rem] h-[32rem] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-12 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                  JG INNOVATIVE HUB
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Engineering & Project Governance System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
        {/* Left Column: Corporate Value Pillars */}
        <div className="lg:w-1/2 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <span>Enterprise Mission & Delivery Acceleration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Precision Delivery. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
              Operational Excellence.
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
            A unified operating platform designed for cross-functional engineering, milestone velocity, blocker triage, and auditable corporate accountability.
          </p>

          {/* Core Corporate Pillars */}
          <div className="space-y-3 pt-2 max-w-lg">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Strategic Portfolio Velocity</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Real-time milestone progression, dependency mapping, and automated critical path tracking across all corporate initiatives.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Proactive Blocker Resolution</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Structured root-cause escalation protocol with mandatory recovery roadmaps to safeguard delivery timelines.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Audited Governance & Quality Gates</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Multi-tiered verification gates and version-controlled weekly reports ensuring compliance and transparent execution.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Reliability Badges */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Enterprise SSL Encryption</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Role-Based Governance</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Immutable Audit Logs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Production Sign In Card */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-left mb-6">
              <h2 className="text-xl font-black text-white">Sign In to Your Workspace</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your corporate credentials to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-300 text-left">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@jginnovative.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500 hover:text-indigo-400 cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMeCheckbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <label htmlFor="rememberMeCheckbox" className="text-xs text-slate-400 cursor-pointer select-none">
                  Keep me signed in on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Production Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 relative z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>&copy; 2026 JG INNOVATIVE HUB PVT. LTD. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
