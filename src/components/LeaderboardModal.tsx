import React, { useState } from 'react';
import { LeaderboardUser, Badge, User } from '../types';
import { 
  Trophy, Medal, Flame, Zap, Award, ShieldCheck, Target, 
  CheckCheck, Crown, X, Sparkles, CheckCircle2 
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardUser[];
  badges: Badge[];
  currentUser: User;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  leaderboard,
  badges,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'BADGES'>('LEADERBOARD');

  if (!isOpen) return null;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/30">1</span>;
      case 2:
        return <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-slate-400/30">2</span>;
      case 3:
        return <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-amber-800/30">3</span>;
      default:
        return <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-700">{rank}</span>;
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'Award': return <Award className="w-6 h-6 text-purple-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'Target': return <Target className="w-6 h-6 text-rose-400" />;
      case 'CheckCheck': return <CheckCheck className="w-6 h-6 text-cyan-400" />;
      case 'Crown': return <Crown className="w-6 h-6 text-amber-400" />;
      default: return <Sparkles className="w-6 h-6 text-indigo-400" />;
    }
  };

  const userEarnedCodes = (currentUser.badges || []).map(b => b.code);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Innovation Hall of Fame & Mastery</span>
              </h2>
              <p className="text-xs text-slate-400">Honoring excellence in milestone delivery, reporting & problem resolution</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'LEADERBOARD'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Medal className="w-4 h-4" />
            <span>Top Contributors (Leaderboard)</span>
          </button>
          <button
            onClick={() => setActiveTab('BADGES')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'BADGES'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Achievement Badges ({badges.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'LEADERBOARD' ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between pb-2 px-3 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <span className="w-12">Rank</span>
                <span className="flex-1">Innovator</span>
                <span className="w-24 text-center">Streak</span>
                <span className="w-24 text-center">Tasks Done</span>
                <span className="w-28 text-right">Total XP</span>
              </div>
              {leaderboard.map(u => {
                const isMe = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isMe 
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-500/10' 
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-12 flex items-center">
                      {getRankBadge(u.rank)}
                    </div>

                    <div className="flex-1 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-slate-200">
                        {u.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{u.fullName}</span>
                          {isMe && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs text-indigo-400 font-semibold">{u.avatarTitle}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[11px] text-slate-400">{u.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-24 flex items-center justify-center text-xs font-bold text-amber-400">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                      <span>{u.streakCount}w</span>
                    </div>

                    <div className="w-24 text-center text-xs font-semibold text-slate-300">
                      {u.completedTasksCount}
                    </div>

                    <div className="w-28 text-right">
                      <span className="text-sm font-extrabold text-indigo-300 font-mono block">
                        {u.xp.toLocaleString()} XP
                      </span>
                      <span className="text-[10px] text-slate-500">Level {u.level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badges.map(b => {
                const isEarned = userEarnedCodes.includes(b.code);
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border flex items-start space-x-4 transition-all ${
                      isEarned
                        ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950/30 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      isEarned 
                        ? 'bg-indigo-600/20 border-indigo-500/40 shadow-md' 
                        : 'bg-slate-800 border-slate-700'
                    }`}>
                      {getBadgeIcon(b.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">{b.title}</h4>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          +{b.xpBonus} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{b.description}</p>
                      <div className="mt-2.5">
                        {isEarned ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-500">
                            Locked • Complete requirement to earn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

