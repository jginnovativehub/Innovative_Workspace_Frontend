import React, { useEffect } from 'react';
import { LogOut, X, Shield, User as UserIcon, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  currentUser: User | null;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  currentUser
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-5 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/10">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Sign Out of Mission Cockpit?</h3>
              <p className="text-xs text-slate-400 mt-0.5">Confirm your session sign-out request</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Identity Card */}
        {currentUser && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <span className="font-bold text-sm text-white block leading-tight">{currentUser.fullName}</span>
                <span className="text-xs text-slate-400 font-mono">{currentUser.email}</span>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                currentUser.role === 'CEO' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                currentUser.role === 'COO' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                currentUser.role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {currentUser.role}
              </span>
              <span className="text-[10px] text-amber-400 font-mono block">
                Level {currentUser.level} • {currentUser.xp} XP
              </span>
            </div>
          </div>
        )}

        {/* Informative message */}
        <p className="text-xs text-slate-300 leading-relaxed">
          Are you sure you want to end your current engineering session? Any unsaved form drafts will be discarded, but your verified deliverables, progress reports, and Innovation XP are safely synced to the database.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            onClick={onConfirmLogout}
            className="cursor-pointer flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-600/25 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

