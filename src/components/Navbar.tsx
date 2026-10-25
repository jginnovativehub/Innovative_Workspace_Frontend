import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import { 
  Trophy, Flame, Bell, UserCheck, Shield, ChevronDown, 
  Sparkles, Check, Clock, AlertTriangle, Layers, LogOut, RefreshCw
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onOpenLeaderboard: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: number) => void;
  onMarkAllNotificationsRead: () => void;
  onLogout?: () => void;
  onRefreshAll?: () => void;
  refreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLeaderboard,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onLogout,
  onRefreshAll,
  refreshing = false
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  // Gamification Level calculations
  const nextLevelXP = currentUser.level * 400;
  const currentLevelBaseXP = (currentUser.level - 1) * 400;
  const progressInLevel = Math.max(0, currentUser.xp - currentLevelBaseXP);
  const xpNeeded = 400;
  const progressPercent = Math.min(100, Math.round((progressInLevel / xpNeeded) * 100));

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-500/20 text-red-300 border-red-500/30',
    CEO: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    COO: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    EMPLOYEE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  };

  const getRoleLabel = (role: string) => {
    if (role === 'CEO') return 'Chief Executive (CEO)';
    if (role === 'COO') return 'Chief Operating (COO)';
    if (role === 'ADMIN') return 'Platform Admin';
    return 'Contributor';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Organization Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                JG INNOVATIVE HUB
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Pvt. Ltd.
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Project, Milestone & Employee Mastery Platform</p>
          </div>
        </div>

        {/* Center: Gamified Innovation HUD */}
        <div className="hidden lg:flex items-center space-x-4 bg-slate-950/60 border border-slate-800/80 px-4 py-1.5 rounded-full">
          {/* Level & Rank Badge */}
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {currentUser.level}
            </span>
            <div className="text-left">
              <span className="text-xs font-semibold text-slate-200 block leading-tight">
                {currentUser.avatarTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Rank Level {currentUser.level}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-36 flex flex-col justify-center">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span className="text-indigo-300 font-semibold">{currentUser.xp} XP</span>
              <span>{nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* On-Time Streak */}
          <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800 text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
            <span>{currentUser.streakCount}w Streak</span>
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Refresh System Data Button */}
          {onRefreshAll && (
            <button
              onClick={onRefreshAll}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors"
              title="Refresh System Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          )}

          {/* Hall of Fame / Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors shadow-sm"
            title="Innovation Hall of Fame & Badges"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Hall of Fame</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white ring-2 ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-xs text-white">Notifications ({unreadCount} new)</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No new notifications.</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-3 text-xs transition-colors hover:bg-slate-800/50 cursor-pointer ${!n.readAt ? 'bg-indigo-950/20' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-slate-200">{n.title}</span>
                          {!n.readAt && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1" />}
                        </div>
                        <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{n.body}</p>
                        <span className="text-[10px] text-slate-500 block mt-1.5">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Secure Authenticated User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                {currentUser.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden md:block">
                <span className="text-xs font-semibold text-white block leading-tight">{currentUser.fullName}</span>
                <span className={`text-[10px] font-bold px-1 py-0.2 rounded border ${roleColors[currentUser.role] || ''}`}>
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
                {/* User Card Header */}
                <div className="p-4 bg-slate-950/90 text-left">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-sm text-white shadow-md">
                      {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-white truncate">{currentUser.fullName}</h4>
                      <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleColors[currentUser.role] || ''}`}>
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/80">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[180px]">{currentUser.email}</span>
                    </div>
                    {currentUser.department && (
                      <div className="flex justify-between text-slate-400">
                        <span className="text-slate-500">Department:</span>
                        <span className="text-slate-200 font-medium">{currentUser.department}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span className="text-slate-500">Rank:</span>
                      <span className="text-indigo-300 font-medium">{currentUser.avatarTitle} (Level {currentUser.level})</span>
                    </div>
                  </div>
                </div>

                {/* Session Security Indicator */}
                <div className="px-4 py-2 bg-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Verified Session</span>
                  </span>
                  <span className="font-mono text-slate-500">ID: #{currentUser.id}</span>
                </div>

                {/* Sign Out Button */}
                {onLogout && (
                  <div className="p-2.5 bg-slate-950/80">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Log Out of Mission Cockpit</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Sign Out Icon */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

