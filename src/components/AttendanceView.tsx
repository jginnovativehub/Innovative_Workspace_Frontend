import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Clock, MessageSquare, ChevronLeft, ChevronRight, 
  UserCheck, AlertCircle, Sparkles, Building2, ShieldCheck, ArrowLeft,
  Edit3, Check, Users, Filter, CalendarDays, Award, Settings2, Trash2, Plus, PartyPopper, Sun
} from 'lucide-react';
import { User, AttendanceRecord, AttendanceSummary, HolidayRecord, WeekendPolicy } from '../types';
import { api } from '../api';
import { toast } from '../context/ToastContext';

interface AttendanceViewProps {
  currentUser: User;
  onBackToDashboard: () => void;
  allUsers?: User[];
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  onBackToDashboard,
  allUsers = []
}) => {
  const isPrivileged = ['ADMIN', 'CEO', 'COO'].includes(currentUser.role);

  // Month navigation: format YYYY-MM
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUser.id);
  const [activeView, setActiveView] = useState<'MY' | 'COMPANY'>('MY');

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Holidays & Weekend Policy state (Default: false, explicitly configured by Admin/CEO/COO)
  const [holidays, setHolidays] = useState<HolidayRecord[]>([]);
  const [weekendPolicy, setWeekendPolicy] = useState<WeekendPolicy>({
    saturdayHoliday: false,
    sundayHoliday: false
  });
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [satHoliday, setSatHoliday] = useState(false);
  const [sunHoliday, setSunHoliday] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayTitle, setNewHolidayTitle] = useState('');
  const [newHolidayType, setNewHolidayType] = useState('COMPANY_HOLIDAY');
  const [newHolidayDesc, setNewHolidayDesc] = useState('');
  const [submittingHoliday, setSubmittingHoliday] = useState(false);

  // Daily Check-in Form state
  const [todayStatus, setTodayStatus] = useState<'PRESENT' | 'HALF_DAY' | 'ON_LEAVE'>('PRESENT');
  const [todayComment, setTodayComment] = useState('');
  const [submittingToday, setSubmittingToday] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | number | null>(null);
  const [editingComment, setEditingComment] = useState('');
  const [selectedDayRecord, setSelectedDayRecord] = useState<{ date: string; record?: AttendanceRecord } | null>(null);

  // Department filter for company view (Privileged only)
  const [deptFilter, setDeptFilter] = useState('ALL');

  const targetUser = (isPrivileged && activeView === 'COMPANY')
    ? (allUsers.find(u => u.id === selectedUserId) || currentUser)
    : currentUser;

  // Load attendance data
  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const uIdToFetch = (isPrivileged && activeView === 'COMPANY') ? selectedUserId : currentUser.id;
      const [records, sum, holData] = await Promise.all([
        api.getAttendance({ month: selectedMonth, userId: uIdToFetch }),
        api.getAttendanceSummary({ month: selectedMonth, userId: uIdToFetch }),
        api.getHolidays().catch(() => ({ holidays: [], weekendPolicy: { saturdayHoliday: false, sundayHoliday: false } }))
      ]);
      setAttendanceRecords(records);
      setSummary(sum);
      setHolidays(holData.holidays || []);
      setWeekendPolicy(holData.weekendPolicy || { saturdayHoliday: false, sundayHoliday: false });
      setSatHoliday(Boolean(holData.weekendPolicy?.saturdayHoliday));
      setSunHoliday(Boolean(holData.weekendPolicy?.sundayHoliday));

      // If user has today's record, populate comment
      if (sum.todayRecord) {
        setTodayComment(sum.todayRecord.comment || '');
        setTodayStatus(sum.todayRecord.status as any || 'PRESENT');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load attendance records', 'Attendance Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth, selectedUserId, activeView]);

  // Handle Mark as Present for Today
  const handleMarkPresent = async () => {
    setSubmittingToday(true);
    try {
      const res = await api.markAttendance({
        status: todayStatus,
        comment: todayComment
      });
      toast.success(res.message || 'Attendance recorded successfully!', 'Checked In');
      await loadAttendanceData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark attendance', 'Error');
    } finally {
      setSubmittingToday(false);
    }
  };

  // Handle Update Comment on past/current record
  const handleSaveComment = async (recordId: string | number) => {
    try {
      await api.updateAttendance(recordId, { comment: editingComment });
      toast.success('Attendance remark saved', 'Updated');
      setEditingRecordId(null);
      await loadAttendanceData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update attendance comment', 'Error');
    }
  };

  // Weekend Policy & Holiday Handlers (Admin, CEO, COO only)
  const handleSaveWeekendPolicy = async () => {
    try {
      const res = await api.updateWeekendPolicy({
        saturdayHoliday: satHoliday,
        sundayHoliday: sunHoliday
      });
      setWeekendPolicy(res.weekendPolicy);
      toast.success('Weekend policy updated successfully', 'Settings Saved');
      await loadAttendanceData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update weekend policy', 'Error');
    }
  };

  const handleCreateHoliday = async () => {
    if (!newHolidayDate || !newHolidayTitle) {
      toast.error('Date and Title are required to declare a holiday', 'Validation');
      return;
    }
    setSubmittingHoliday(true);
    try {
      await api.createHoliday({
        date: newHolidayDate,
        title: newHolidayTitle,
        type: newHolidayType,
        description: newHolidayDesc
      });
      toast.success(`Holiday "${newHolidayTitle}" declared!`, 'Holiday Added');
      setNewHolidayDate('');
      setNewHolidayTitle('');
      setNewHolidayDesc('');
      await loadAttendanceData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to declare holiday', 'Error');
    } finally {
      setSubmittingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to remove this company holiday?')) return;
    try {
      await api.deleteHoliday(id);
      toast.success('Company holiday removed', 'Deleted');
      await loadAttendanceData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove holiday', 'Error');
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleResetToCurrentMonth = () => {
    setSelectedMonth(currentMonthStr);
  };

  // Month Display Label (e.g. "November 2026")
  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const monthDate = new Date(yearNum, monthNum - 1, 1);
  const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar days grid
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay(); // 0 is Sun, 1 is Mon
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = (firstDayOfWeek + 6) % 7;

  // Build array of attendance lookup by date YYYY-MM-DD
  const recordsByDate = new Map<string, AttendanceRecord>();
  attendanceRecords.forEach(r => {
    if (r.date) recordsByDate.set(r.date, r);
  });

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isCurrentMonth = selectedMonth === currentMonthStr;

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      {/* Top Banner & Navigation */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <span className="text-gray-300">•</span>
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Calendar className="w-3 h-3" />
              <span>Attendance Portal</span>
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight flex flex-wrap items-center gap-2">
            <span>Monthly Attendance Calendar</span>
            <span className="text-xs px-2 py-0.5 rounded-md font-mono font-medium bg-gray-100 text-gray-600 max-w-full truncate">
              {targetUser.fullName}
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track daily work attendance, on-time check-ins, leaves, and activity remarks.
            {!isPrivileged && (
              <span className="ml-1 text-emerald-600 font-medium inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 inline" /> Confidential & Private to You
              </span>
            )}
          </p>
        </div>

        {/* View Switcher for CEO / COO & Holiday Policy Button */}
        {isPrivileged && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setActiveView('MY');
                  setSelectedUserId(currentUser.id);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeView === 'MY'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Attendance
              </button>
              <button
                onClick={() => setActiveView('COMPANY')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeView === 'COMPANY'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Roster ({allUsers.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center space-x-1.5 shadow-2xs"
              title="Configure Weekend Policy (Saturday/Sunday) and Company Holidays"
            >
              <PartyPopper className="w-3.5 h-3.5 text-purple-600" />
              <span>Holiday & Weekend Policy</span>
            </button>
          </div>
        )}
      </div>

      {/* Privileged Employee Selector & Company Roll-Call Metrics */}
      {isPrivileged && activeView === 'COMPANY' && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Executive Workforce Overview</h3>
                <p className="text-xs text-gray-600">Select any employee to view their individual attendance calendar.</p>
              </div>
            </div>

            {/* Department Filter & Employee Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Departments</option>
                {Array.from(new Set(allUsers.map(u => u.department).filter(Boolean))).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(Number(e.target.value))}
                className="w-full sm:w-auto max-w-full px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                {allUsers
                  .filter(u => deptFilter === 'ALL' || u.department === deptFilter)
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role} - {u.department || 'Staff'})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          {summary?.companyOverview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-blue-200/80">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-[11px] font-medium text-gray-500 block">Workforce Active</span>
                <span className="text-xl font-bold text-gray-900 mt-0.5 block">{summary.companyOverview.totalEmployees} Staff</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-[11px] font-medium text-emerald-600 block">Present Today</span>
                <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{summary.companyOverview.presentToday}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-[11px] font-medium text-amber-600 block">On Leave Today</span>
                <span className="text-xl font-bold text-amber-700 mt-0.5 block">{summary.companyOverview.onLeaveToday}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-[11px] font-medium text-blue-600 block">Today's Attendance Rate</span>
                <span className="text-xl font-bold text-blue-700 mt-0.5 block">{summary.companyOverview.attendanceRateToday}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Today's Check-in Card (for user) + Summary KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Today's Action Widget */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Today's Check-in</span>
              </span>
              <span className="text-xs font-mono font-medium text-gray-500">
                {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {summary?.isMarkedToday ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Marked as Present</h4>
                    <p className="text-xs text-emerald-700">
                      Check-in recorded at {summary.todayRecord?.markedAt ? new Date(summary.todayRecord.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </p>
                  </div>
                </div>

                {summary.todayRecord?.comment && (
                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 text-xs text-gray-700">
                    <span className="font-semibold text-emerald-800 block text-[11px] mb-0.5">Remark:</span>
                    {summary.todayRecord.comment}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Record your daily attendance status and log optional work remarks or activity summaries.
                </p>

                {/* Status Toggle */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTodayStatus('PRESENT')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      todayStatus === 'PRESENT'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setTodayStatus('HALF_DAY')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      todayStatus === 'HALF_DAY'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    Half Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setTodayStatus('ON_LEAVE')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      todayStatus === 'ON_LEAVE'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    On Leave
                  </button>
                </div>
              </div>
            )}

            {/* Comment / Remarks Input */}
            <div className="mt-3">
              <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                Optional Daily Remark / Task Summary:
              </label>
              <input
                type="text"
                placeholder="e.g., Working on Milestone 3 routing / WFH / Client sync"
                value={todayComment}
                onChange={e => setTodayComment(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleMarkPresent}
              disabled={submittingToday}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs ${
                summary?.isMarkedToday
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {summary?.isMarkedToday ? (
                <>
                  <Edit3 className="w-4 h-4 text-gray-600" />
                  <span>{submittingToday ? 'Updating...' : 'Update Today\'s Remark / Status'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingToday ? 'Recording...' : 'Mark as Present'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2 & 3: Monthly Statistics Cards */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{monthName} Statistics</h3>
                  <p className="text-xs text-gray-500 truncate">Summary performance metrics for {targetUser.fullName}</p>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                Monthly Performance
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5">
                <span className="text-[11px] font-medium text-gray-500 block">Days Present</span>
                <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                  {summary?.stats.present ?? 0}
                </span>
                <span className="text-[10px] text-gray-400">Full day check-ins</span>
              </div>

              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5">
                <span className="text-[11px] font-medium text-gray-500 block">Half Days</span>
                <span className="text-2xl font-bold text-amber-700 mt-1 block">
                  {summary?.stats.halfDay ?? 0}
                </span>
                <span className="text-[10px] text-gray-400">Partial workdays</span>
              </div>

              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5">
                <span className="text-[11px] font-medium text-gray-500 block">Approved Leaves</span>
                <span className="text-2xl font-bold text-blue-700 mt-1 block">
                  {summary?.stats.leave ?? 0}
                </span>
                <span className="text-[10px] text-gray-400">Scheduled leave</span>
              </div>

              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5">
                <span className="text-[11px] font-medium text-gray-500 block">Attendance Rate</span>
                <span className="text-2xl font-bold text-purple-700 mt-1 block">
                  {summary?.stats.totalMarked && daysInMonth
                    ? Math.round((summary.stats.present / Math.max(1, summary.stats.totalMarked)) * 100)
                    : 100}%
                </span>
                <span className="text-[10px] text-gray-400">Monthly reliability</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center flex-wrap gap-4 text-xs text-gray-600">
            <span className="font-semibold text-gray-700">Status Indicator:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Present (P)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Half Day (HD)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>On Leave (L)</span>
            </div>
            {Boolean(weekendPolicy.saturdayHoliday || weekendPolicy.sundayHoliday) && (
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span>Weekend Off</span>
              </div>
            )}
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Holiday (🎉)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Monthly Calendar Grid */}
      <div className="bg-white border-2 border-gray-300 rounded-2xl shadow-sm overflow-hidden">
        {/* Calendar Header with Navigation */}
        <div className="p-4 sm:p-5 bg-gray-50 border-b-2 border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center space-x-2">
              <span>{monthName}</span>
              {isCurrentMonth && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Current Month
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer shadow-2xs"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetToCurrentMonth}
              className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors cursor-pointer shadow-2xs"
            >
              Today
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer shadow-2xs"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b-2 border-gray-300 bg-gray-100 divide-x divide-gray-300 text-center text-[10px] sm:text-xs font-bold text-gray-700 py-2 sm:py-3 tracking-wider uppercase">
          <div className="py-0.5">Mon</div>
          <div className="py-0.5">Tue</div>
          <div className="py-0.5">Wed</div>
          <div className="py-0.5">Thu</div>
          <div className="py-0.5">Fri</div>
          <div className={`py-0.5 ${weekendPolicy.saturdayHoliday ? 'text-rose-600 bg-rose-50/50' : 'text-gray-700'}`}>
            Sat <span className="hidden sm:inline">{weekendPolicy.saturdayHoliday ? '(Off)' : ''}</span>
          </div>
          <div className={`py-0.5 ${weekendPolicy.sundayHoliday ? 'text-rose-600 bg-rose-50/50' : 'text-gray-700'}`}>
            Sun <span className="hidden sm:inline">{weekendPolicy.sundayHoliday ? '(Off)' : ''}</span>
          </div>
        </div>

        {/* Month Calendar Cells with Crisp Solid 1px Grid Lines */}
        <div className="grid grid-cols-7 gap-[1px] bg-gray-300">
          {/* Leading blank days */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[68px] sm:min-h-[120px] bg-gray-100/70 p-1 sm:p-2.5 opacity-60 min-w-0 overflow-hidden" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const record = recordsByDate.get(dateStr);
            const isToday = dateStr === todayStr;
            const dayOfWeek = (startOffset + idx) % 7;
            const isSaturday = dayOfWeek === 5;
            const isSunday = dayOfWeek === 6;

            const holiday = holidays.find(h => h.date === dateStr);
            const isWeekendOff = (isSaturday && weekendPolicy.saturdayHoliday) || (isSunday && weekendPolicy.sundayHoliday);

            let badgeBg = 'bg-gray-100 text-gray-500';
            let label = '';
            let shortLabel = '';
            if (record) {
              if (record.status === 'PRESENT') {
                badgeBg = 'bg-emerald-50 text-emerald-700 border border-emerald-300';
                label = 'Present';
                shortLabel = 'P';
              } else if (record.status === 'HALF_DAY') {
                badgeBg = 'bg-amber-50 text-amber-700 border border-amber-300';
                label = 'Half Day';
                shortLabel = 'HD';
              } else if (record.status === 'ON_LEAVE') {
                badgeBg = 'bg-blue-50 text-blue-700 border border-blue-300';
                label = 'On Leave';
                shortLabel = 'L';
              } else if (record.status === 'ABSENT') {
                badgeBg = 'bg-rose-50 text-rose-700 border border-rose-300';
                label = 'Absent';
                shortLabel = 'A';
              }
            }

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDayRecord({ date: dateStr, record })}
                className={`min-h-[68px] sm:min-h-[120px] p-1 sm:p-2.5 min-w-0 overflow-hidden transition-all flex flex-col justify-between cursor-pointer group ${
                  isToday 
                    ? 'bg-blue-50/40 ring-2 ring-blue-600 ring-inset z-10' 
                    : holiday
                    ? 'bg-purple-50/50 hover:bg-purple-100/50'
                    : isWeekendOff 
                    ? 'bg-gray-50/80 hover:bg-gray-100/60' 
                    : 'bg-white hover:bg-blue-50/30'
                }`}
              >
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 items-center">
                  <span
                    className={`text-[11px] sm:text-xs font-bold flex items-center justify-center min-w-[22px] sm:min-w-[24px] h-5 sm:h-6 px-1 sm:px-1.5 rounded-md sm:rounded-lg transition-colors shrink-0 ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-xs'
                        : holiday
                        ? 'bg-purple-600 text-white shadow-xs'
                        : isWeekendOff
                        ? 'text-rose-600 font-bold'
                        : 'text-gray-900 group-hover:text-blue-600'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {holiday ? (
                    <span className="text-[9px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-300 flex items-center space-x-1 shrink-0 max-w-full">
                      <Sparkles className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                      <span className="hidden sm:inline">Holiday</span>
                    </span>
                  ) : record ? (
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-full ${badgeBg}`}>
                      <span className="sm:hidden">{shortLabel}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </span>
                  ) : isWeekendOff ? (
                    <span className="text-[9px] sm:text-[10px] font-semibold px-1 sm:px-1.5 py-0.5 rounded bg-gray-200/80 text-gray-600 border border-gray-300 truncate max-w-full">
                      <span className="sm:hidden">Off</span>
                      <span className="hidden sm:inline">{isSunday ? 'Sun Off' : 'Sat Off'}</span>
                    </span>
                  ) : null}
                </div>

                {/* Mobile Compact Indicator Dots */}
                <div className="sm:hidden flex items-center justify-center gap-1 mt-1 min-h-[10px]">
                  {record?.comment && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Has comment" />
                  )}
                  {holiday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title={holiday.title} />
                  )}
                </div>

                {/* Day Body / Comment Preview & Holiday title (Tablet & Desktop) */}
                <div className="hidden sm:block my-1.5 flex-1 space-y-1">
                  {holiday && (
                    <div 
                      className="bg-purple-100/90 border border-purple-200 text-purple-900 font-bold rounded-lg px-2 py-1 text-[11px] flex items-center space-x-1.5 shadow-2xs line-clamp-1"
                      title={holiday.description || holiday.title}
                    >
                      <PartyPopper className="w-3 h-3 text-purple-600 shrink-0" />
                      <span className="truncate">{holiday.title}</span>
                    </div>
                  )}

                  {record?.comment ? (
                    <div 
                      className="bg-gray-50 group-hover:bg-white border border-gray-200 rounded-lg p-1.5 text-[11px] text-gray-700 line-clamp-2 leading-snug shadow-2xs"
                      title={record.comment}
                    >
                      <MessageSquare className="w-3 h-3 inline mr-1 text-blue-500 shrink-0" />
                      <span>{record.comment}</span>
                    </div>
                  ) : record ? (
                    <span className="text-[10px] text-gray-400 italic">No remarks</span>
                  ) : holiday ? null : isWeekendOff ? (
                    <span className="text-[10px] text-gray-400 italic">Rest Day</span>
                  ) : (
                    <span className="text-[10px] text-gray-300">—</span>
                  )}
                </div>

                {/* Footer Check-in Time (Tablet & Desktop) */}
                {record?.markedAt && (
                  <div className="hidden sm:flex text-[9px] text-gray-500 font-mono items-center space-x-1 pt-1 border-t border-gray-100">
                    <Clock className="w-2.5 h-2.5 text-gray-400" />
                    <span>{new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  {new Date(selectedDayRecord.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayRecord(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Check if this date is a declared Holiday */}
              {(() => {
                const dayHoliday = holidays.find(h => h.date === selectedDayRecord.date);
                if (dayHoliday) {
                  return (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <PartyPopper className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-purple-900 text-xs block">
                            Company Holiday: {dayHoliday.title}
                          </span>
                          <span className="text-[11px] text-purple-700 block mt-0.5">
                            {dayHoliday.description || 'Official company holiday'} ({dayHoliday.type?.replace('_', ' ')})
                          </span>
                        </div>
                      </div>
                      {isPrivileged && (
                        <button
                          onClick={() => handleDeleteHoliday(dayHoliday.id || dayHoliday._id!)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold flex items-center space-x-1 shrink-0 p-1"
                          title="Remove this company holiday"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <span className="text-gray-500 block mb-1 font-medium">Employee Name</span>
                <span className="text-sm font-bold text-gray-900">{targetUser.fullName}</span>
                <span className="text-gray-500 ml-2">({targetUser.role} - {targetUser.department})</span>
              </div>

              <div>
                <span className="text-gray-500 block mb-1 font-medium">Attendance Status</span>
                {selectedDayRecord.record ? (
                  <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs ${
                    selectedDayRecord.record.status === 'PRESENT'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : selectedDayRecord.record.status === 'HALF_DAY'
                      ? 'bg-amber-50 text-amber-700 border border-amber-300'
                      : 'bg-blue-50 text-blue-700 border border-blue-300'
                  }`}>
                    {selectedDayRecord.record.status.replace('_', ' ')}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">No attendance record logged for this day.</span>
                )}
              </div>

              {/* Timestamp */}
              {selectedDayRecord.record?.markedAt && (
                <div>
                  <span className="text-gray-500 block mb-1 font-medium">Logged Timestamp</span>
                  <span className="font-mono text-gray-700">
                    {new Date(selectedDayRecord.record.markedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Comment / Remarks Form */}
              <div className="pt-2 border-t border-gray-100">
                <label className="text-gray-700 block mb-1 font-bold">
                  Daily Remark / Task Summary:
                </label>

                {editingRecordId === (selectedDayRecord.record?.id || 'new') ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editingComment}
                      onChange={e => setEditingComment(e.target.value)}
                      placeholder="Add comments or work summary..."
                      className="w-full p-2.5 rounded-lg border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingRecordId(null)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (selectedDayRecord.record?.id) {
                            handleSaveComment(selectedDayRecord.record.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      >
                        Save Remark
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p className="text-gray-700 italic flex-1">
                      {selectedDayRecord.record?.comment || 'No comment recorded for this day.'}
                    </p>
                    {selectedDayRecord.record && (
                      <button
                        onClick={() => {
                          setEditingRecordId(selectedDayRecord.record!.id);
                          setEditingComment(selectedDayRecord.record!.comment || '');
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Holiday Declaration button for Admin/CEO/COO on non-holiday days */}
              {isPrivileged && !holidays.some(h => h.date === selectedDayRecord.date) && (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-500">Need to mark this date as a company holiday?</span>
                  <button
                    onClick={() => {
                      setNewHolidayDate(selectedDayRecord.date);
                      setSelectedDayRecord(null);
                      setIsHolidayModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Declare Holiday</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedDayRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday & Weekend Policy Configuration Modal (Admin, CEO, COO only) */}
      {isHolidayModalOpen && isPrivileged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-purple-50/80 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PartyPopper className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-purple-900">
                    Company Holiday & Weekend Policy Governance
                  </h3>
                  <p className="text-[11px] text-purple-700">
                    Configure official weekend off days and declare recognized company holidays (Admin, CEO, COO authority).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-6 overflow-y-auto text-xs">
              {/* Section 1: Weekend Policy Toggles */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                    Weekend Schedule Configuration
                  </h4>
                </div>
                <p className="text-gray-500 text-[11px]">
                  Decide whether Saturdays and Sundays are recognized company holidays (Off) or standard working days.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border bg-white cursor-pointer hover:border-purple-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={satHoliday}
                      onChange={e => setSatHoliday(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block text-xs">Saturday is a Holiday (Off)</span>
                      <span className="text-[11px] text-gray-500">
                        {satHoliday ? 'Marked as Company Rest Day' : 'Marked as Working Day'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border bg-white cursor-pointer hover:border-purple-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={sunHoliday}
                      onChange={e => setSunHoliday(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block text-xs">Sunday is a Holiday (Off)</span>
                      <span className="text-[11px] text-gray-500">
                        {sunHoliday ? 'Marked as Company Rest Day' : 'Marked as Working Day'}
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveWeekendPolicy}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Weekend Settings</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Declare New Holiday */}
              <div className="border border-purple-200 bg-purple-50/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <PartyPopper className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                    Declare New Company Holiday
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                      Holiday Date *
                    </label>
                    <input
                      type="date"
                      value={newHolidayDate}
                      onChange={e => setNewHolidayDate(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                      Holiday Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Diwali, Team Day"
                      value={newHolidayTitle}
                      onChange={e => setNewHolidayTitle(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                      Holiday Category
                    </label>
                    <select
                      value={newHolidayType}
                      onChange={e => setNewHolidayType(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                    >
                      <option value="COMPANY_HOLIDAY">Company Holiday</option>
                      <option value="PUBLIC_HOLIDAY">Public Holiday</option>
                      <option value="FESTIVAL">Festival</option>
                      <option value="OPTIONAL_HOLIDAY">Optional Holiday</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Description / Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Short description of the celebration or event"
                    value={newHolidayDesc}
                    onChange={e => setNewHolidayDesc(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleCreateHoliday}
                    disabled={submittingHoliday}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{submittingHoliday ? 'Declaring...' : 'Declare Company Holiday'}</span>
                  </button>
                </div>
              </div>

              {/* Section 3: List of Declared Holidays */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Recognized Company Holidays ({holidays.length})
                </h4>
                {holidays.length === 0 ? (
                  <p className="text-gray-400 italic py-2">No company holidays declared yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                    {holidays
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map(h => (
                        <div key={h.id || h._id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                              {h.date}
                            </span>
                            <div>
                              <span className="font-bold text-gray-900 block text-xs">{h.title}</span>
                              <span className="text-[11px] text-gray-500">
                                {h.description || 'Company Holiday'} &bull; {h.type?.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteHoliday(h.id || h._id!)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                            title="Delete holiday"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
