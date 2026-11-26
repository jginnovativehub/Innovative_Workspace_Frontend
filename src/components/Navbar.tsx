import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import { 
  Trophy, Flame, Bell, ChevronDown, 
  LogOut, RefreshCw, Lock, CalendarCheck
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface NavbarProps {
  currentUser: User;
  onOpenLeaderboard: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: number | string) => void;
  onMarkAllNotificationsRead: () => void;
  onLogout?: () => void;
  onRefreshAll?: () => void;
  refreshing?: boolean;
  onOpenPersonalTracker?: () => void;
  isPersonalTrackerActive?: boolean;
  onOpenAttendance?: () => void;
  isAttendanceActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLeaderboard,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onLogout,
  onRefreshAll,
  refreshing = false,
  onOpenPersonalTracker,
  isPersonalTrackerActive = false,
  onOpenAttendance,
  isAttendanceActive = false
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
    ADMIN: 'bg-red-50 text-red-700 border-red-200',
    CEO: 'bg-purple-50 text-purple-700 border-purple-200',
    COO: 'bg-blue-50 text-blue-700 border-blue-200',
    EMPLOYEE: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const getRoleLabel = (role: string) => {
    if (role === 'CEO') return 'Chief Executive (CEO)';
    if (role === 'COO') return 'Chief Operating (COO)';
    if (role === 'ADMIN') return 'Platform Admin';
    return 'Contributor';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 text-gray-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand & Organization Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs shrink-0 border border-gray-200 overflow-hidden">
            <img src={logoImg} alt="Innovative Hub" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-bold text-xs sm:text-base text-gray-900 tracking-tight truncate">
                INNOVATIVE HUB
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                Pvt. Ltd.
              </span>
            </div>
            <p className="hidden sm:block text-xs text-gray-500 truncate">Project & Milestone Management</p>
          </div>
        </div>

        {/* Center: Innovation Status HUD */}
        <div className="hidden lg:flex items-center space-x-4 bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-full shadow-2xs">
          {/* Level & Rank Badge */}
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              {currentUser.level}
            </span>
            <div className="text-left">
              <span className="text-xs font-semibold text-gray-900 block leading-tight">
                {currentUser.avatarTitle}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Rank Level {currentUser.level}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-32 flex flex-col justify-center">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1">
              <span className="text-blue-700 font-semibold">{currentUser.xp} XP</span>
              <span>{nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* On-Time Streak */}
          <div 
            className="flex items-center space-x-1.5 pl-3 border-l border-gray-200 text-amber-700 text-xs font-bold cursor-help"
            title={`Consecutive On-Time Delivery Streak: ${currentUser.streakCount ?? 0} weeks with 100% on-time milestone & report delivery`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{(currentUser.streakCount ?? 0)}w Streak</span>
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center space-x-1 sm:space-x-2.5 shrink-0">
          {/* Refresh System Data Button */}
          {onRefreshAll && (
            <button
              onClick={onRefreshAll}
              disabled={refreshing}
              className="p-1.5 sm:p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
              title="Refresh System Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          {/* Personal Project Tracker Button */}
          {onOpenPersonalTracker && (
            <button
              onClick={onOpenPersonalTracker}
              className={`flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-xs ${
                isPersonalTrackerActive
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
              }`}
              title="Open Private Personal Project Tracker"
            >
              <Lock className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden md:inline">Personal Projects</span>
            </button>
          )}

          {/* Attendance Calendar & Check-in Button */}
          {onOpenAttendance && (
            <button
              onClick={onOpenAttendance}
              className={`flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-xs ${
                isAttendanceActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'
              }`}
              title="Open Attendance Calendar & Daily Check-in"
            >
              <CalendarCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Attendance</span>
            </button>
          )}

          {/* Hall of Fame / Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition-colors shadow-xs"
            title="Innovation Hall of Fame & Badges"
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="hidden lg:inline">Hall of Fame</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-1.5 sm:p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold flex items-center justify-center text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="fixed inset-x-3 top-16 sm:inset-x-auto sm:top-auto sm:absolute sm:right-0 sm:mt-2 w-auto sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-xs text-gray-900">Notifications ({unreadCount} new)</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">No new notifications.</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-3 text-xs transition-colors hover:bg-gray-50 cursor-pointer ${!n.readAt ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-gray-900">{n.title}</span>
                          {!n.readAt && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1" />}
                        </div>
                        <p className="text-gray-600 mt-1 leading-relaxed text-[11px]">{n.body}</p>
                        <span className="text-[10px] text-gray-400 block mt-1.5">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Authenticated User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 pr-2 sm:pl-2 sm:pr-2.5 py-1 sm:py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
                {currentUser.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden md:block">
                <span className="text-xs font-semibold text-gray-900 block leading-tight">{currentUser.fullName}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleColors[currentUser.role] || ''}`}>
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5 sm:ml-1" />
            </button>

            {showUserDropdown && (
              <div className="fixed inset-x-3 top-16 sm:inset-x-auto sm:top-auto sm:absolute sm:right-0 sm:mt-2 w-auto sm:w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100">
                {/* User Card Header */}
                <div className="p-4 bg-gray-50/70 text-left">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-xs">
                      {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{currentUser.fullName}</h4>
                      <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleColors[currentUser.role] || ''}`}>
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </div>
                  </div>

                  {/* Mobile XP & Streak Summary (visible below lg where center HUD hides) */}
                  <div className="lg:hidden mb-3 p-2.5 rounded-lg bg-white border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-blue-700">{currentUser.xp} / {nextLevelXP} XP</span>
                      <span className="text-amber-700 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {(currentUser.streakCount ?? 0)}w Streak
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-gray-200">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-800 font-medium truncate">{currentUser.email}</span>
                    </div>
                    {currentUser.department && (
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Department:</span>
                        <span className="text-gray-800 font-medium">{currentUser.department}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Rank:</span>
                      <span className="text-blue-700 font-medium text-right">{currentUser.avatarTitle} (Level {currentUser.level})</span>
                    </div>
                  </div>
                </div>

                {/* Session Security Indicator */}
                <div className="px-4 py-2 bg-white flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Verified Session</span>
                  </span>
                  <span className="font-mono text-gray-400">ID: #{currentUser.id}</span>
                </div>

                {/* Sign Out Button */}
                {onLogout && (
                  <div className="p-2.5 bg-gray-50">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Sign Out Icon (Desktop/Tablet) */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="hidden sm:inline-flex p-2 rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-700 transition-colors cursor-pointer"
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
