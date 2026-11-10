import React, { useState } from 'react';
import { 
  Layers, Shield, Lock, Mail, ArrowRight, 
  Eye, EyeOff, AlertCircle, RefreshCw, CheckCircle2,
  TrendingUp, Award, Clock
} from 'lucide-react';
import { api } from '../api';
import { User } from '../types';
import logoImg from '../assets/logo.png';

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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm shrink-0 border border-gray-200 overflow-hidden">
              <img src={logoImg} alt="Innovative Hub" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-gray-900 tracking-wide">
                  INNOVATIVE HUB
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-50 text-gray-700 border border-gray-200">
                  Workspace
                </span>
              </div>
              <p className="text-xs text-gray-600">Project & Milestone Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left Column: Corporate Value Pillars */}
        <div className="lg:w-1/2 space-y-6 text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Precision Delivery. <br />
            <span className="text-indigo-700">Operational Excellence.</span>
          </h1>

          <p className="text-gray-700 text-sm leading-relaxed max-w-lg">
            A unified operating platform designed for cross-functional engineering, milestone velocity, blocker triage, and auditable corporate accountability.
          </p>

          {/* Core Corporate Pillars */}
          <div className="space-y-3 pt-2 max-w-lg">
            <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-700 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Strategic Portfolio Velocity</h3>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Real-time milestone progression, dependency mapping, and automated critical path tracking across all corporate initiatives.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-700 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Proactive Blocker Resolution</h3>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Structured root-cause escalation protocol with mandatory recovery roadmaps to safeguard delivery timelines.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Audited Governance & Quality Gates</h3>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Multi-tiered verification gates and version-controlled weekly reports ensuring compliance and transparent execution.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Reliability Badges */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-gray-600 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Enterprise SSL Encryption</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-700" />
              <span>Role-Based Governance</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-700" />
              <span>Immutable Audit Logs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Production Sign In Card */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-left mb-6">
              <h2 className="text-xl font-black text-gray-900">Sign In to Your Workspace</h2>
              <p className="text-xs text-gray-600 mt-1">Enter your corporate credentials to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-700 text-left">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@jginnovative.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/80 border border-gray-200 text-gray-900 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Password
                  </label>
                  <span className="text-[11px] text-gray-900 hover:text-indigo-700 cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-600">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/80 border border-gray-200 text-gray-900 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-900 hover:text-gray-700"
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
                  className="rounded bg-white border-gray-200 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <label htmlFor="rememberMeCheckbox" className="text-xs text-gray-900 cursor-pointer select-none">
                  Keep me signed in on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-gray-900 font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
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
      <footer className="border-t border-gray-200 bg-white backdrop-blur-md px-6 py-4 relative z-10 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>&copy; 2026 JG INNOVATIVE HUB PVT. LTD. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

