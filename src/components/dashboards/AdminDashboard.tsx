import React, { useState } from 'react';
import { User, Project, AuditEvent, SystemConfig } from '../../types';
import { 
  Shield, Users, FolderKanban, Settings, FileSearch, UserPlus, 
  Trash2, Archive, RefreshCw, Check, AlertOctagon, Activity, 
  Database, Clock, CheckCircle2, Lock
} from 'lucide-react';
import { toast } from '../../context/ToastContext';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  auditEvents: AuditEvent[];
  config: SystemConfig;
  onCreateUser: (data: any) => Promise<void>;
  onUpdateUser: (id: number, data: any) => Promise<void>;
  onArchiveProject: (id: number) => Promise<void>;
  onRestoreProject: (id: number) => Promise<void>;
  onDeleteProject: (id: number, reason: string) => Promise<void>;
  onUpdateConfig: (data: any) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  projects,
  auditEvents,
  config,
  onCreateUser,
  onUpdateUser,
  onArchiveProject,
  onRestoreProject,
  onDeleteProject,
  onUpdateConfig
}) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'PROJECTS' | 'CONFIG' | 'AUDIT'>('USERS');

  // User provisioning state
  const [showAddUser, setShowAddUser] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Welcome2026!');
  const [role, setRole] = useState<'EMPLOYEE' | 'CEO' | 'COO' | 'ADMIN'>('EMPLOYEE');
  const [department, setDepartment] = useState('Engineering');

  // Protected deletion state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Config state
  const [deadlineDay, setDeadlineDay] = useState(config.reportingDeadlineDay || 'Friday');
  const [deadlineTime, setDeadlineTime] = useState(config.reportingDeadlineTime || '17:00');
  const [timezone, setTimezone] = useState(config.companyTimezone || 'Asia/Kolkata');

  // Audit filter state
  const [auditFilterActor, setAuditFilterActor] = useState('');
  const [auditFilterAction, setAuditFilterAction] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    await onCreateUser({ fullName, email, password, role, department });
    setFullName('');
    setEmail('');
    setShowAddUser(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId || !deleteReason || deleteReason.trim().length < 5) {
      toast.warning('A documented justification of at least 5 characters is mandatory for permanent deletion!', 'Audit Justification Required');
      return;
    }
    await onDeleteProject(deleteTargetId, deleteReason);
    setDeleteTargetId(null);
    setDeleteReason('');
    toast.success('Project permanently deleted and recorded in audit log!', 'Project Removed');
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateConfig({
      reportingDeadlineDay: deadlineDay,
      reportingDeadlineTime: deadlineTime,
      companyTimezone: timezone
    });
    toast.success('System configuration updated and recorded in audit log!', 'Configuration Saved');
  };

  const filteredAudits = auditEvents.filter(a => {
    if (auditFilterActor && !a.actorName?.toLowerCase().includes(auditFilterActor.toLowerCase())) return false;
    if (auditFilterAction && !a.action.toLowerCase().includes(auditFilterAction.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Admin Cockpit Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/40 font-mono">
                ADMINISTRATOR DASHBOARD
              </span>
              <span className="text-xs text-slate-400">Platform Governance & Audit</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">System Oversight & Control Console</h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Centralized user lifecycle administration, global project records, operational parameters, and protected permanent deletions with complete traceability.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">System Health</span>
              <div className="flex items-center justify-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400">Optimal (100%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Accounts</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white">{users.length}</span>
          <span className="text-[10px] text-slate-400 block mt-1">
            {users.filter(u => u.active).length} Active • {users.filter(u => !u.active).length} Deactivated
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <FolderKanban className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white">{projects.length}</span>
          <span className="text-[10px] text-slate-400 block mt-1">
            {projects.filter(p => p.status === 'ACTIVE').length} Active • {projects.filter(p => p.status === 'ARCHIVED').length} Archived
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Trail Logs</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white">{auditEvents.length}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Append-only compliance log</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Cadence Deadline</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-lg font-black text-white">{config.reportingDeadlineDay}</span>
          <span className="text-[10px] text-slate-400 block mt-1">
            {config.reportingDeadlineTime} ({config.companyTimezone})
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'USERS' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Lifecycle & Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROJECTS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'PROJECTS' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>All Projects Oversight ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'CONFIG' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Operational Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'AUDIT' ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>Security Audit Trail ({auditEvents.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Employee & Management Accounts</h3>
              <p className="text-xs text-slate-400">Create, assign RBAC permissions, reset credentials, or deactivate employees.</p>
            </div>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision User Account</span>
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleCreateUser} className="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 space-y-4 shadow-xl">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">New User Provisioning</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rachel.adams@jginnovative.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Platform Role *</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Tasks & Reports)</option>
                    <option value="CEO">CEO (Strategic Portfolio)</option>
                    <option value="COO">COO (Operations & Review Inbox)</option>
                    <option value="ADMIN">ADMIN (Full Authority)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Engineering / Hardware / Firmware"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddUser(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white">Create & Invite</button>
              </div>
            </form>
          )}

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {users.map(u => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
                      {u.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{u.fullName}</span>
                        <span className="text-xs text-slate-400 font-mono">({u.email})</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-indigo-400 font-medium">{u.department}</span>
                        <span>•</span>
                        <span>Level {u.level} {u.avatarTitle} ({u.xp} XP)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <select
                      value={u.role}
                      onChange={e => onUpdateUser(u.id, { role: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="CEO">CEO</option>
                      <option value="COO">COO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>

                    <button
                      onClick={() => onUpdateUser(u.id, { active: !u.active })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        u.active 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      {u.active ? 'Active' : 'Deactivated'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS OVERSIGHT */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Company Project Oversight</h3>
              <p className="text-xs text-slate-400">Full visibility of all initiatives. Perform controlled archiving, restoration, and permanent deletions.</p>
            </div>
          </div>

          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-indigo-400 text-xs px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {p.code}
                    </span>
                    <h4 className="font-bold text-base text-white">{p.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      p.status === 'ARCHIVED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{p.objective}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                    <span>Owner: <strong className="text-slate-200">{p.ownerName}</strong></span>
                    <span>Stages: <strong className="text-slate-200">{p.milestonesCount} Milestones</strong></span>
                    <span>Progress: <strong className="text-emerald-400">{p.progressPercentage}%</strong></span>
                    <span>Target: <strong className="text-slate-200 font-mono">{p.targetDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  {p.status === 'ARCHIVED' ? (
                    <button
                      onClick={() => onRestoreProject(p.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restore Project</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchiveProject(p.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteTargetId(p.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                    title="Protected Permanent Deletion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanent Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL CONFIGURATION */}
      {activeTab === 'CONFIG' && (
        <form onSubmit={handleSaveConfig} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 max-w-2xl space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Company Operating Parameters</h3>
            <p className="text-xs text-slate-400">Configure weekly report deadlines, timezone, and data policies.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Weekly Report Cut-Off Day *</label>
              <select
                value={deadlineDay}
                onChange={e => setDeadlineDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday (Company Standard)</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Weekly Report Cut-Off Time *</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={e => setDeadlineTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Company Standard Timezone *</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
            >
              Save Configuration Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Append-Only Audit Trail</h3>
              <p className="text-xs text-slate-400">Immutable ledger of sensitive operations, status shifts, and schedule alterations.</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Filter by actor..."
                value={auditFilterActor}
                onChange={e => setAuditFilterActor(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Filter action..."
                value={auditFilterAction}
                onChange={e => setAuditFilterAction(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredAudits.map(a => (
              <div key={a.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1 font-mono hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-indigo-400">{a.action}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{a.entityType} #{a.entityId}</span>
                  </div>
                  <span className="text-slate-500">{new Date(a.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Actor: <strong className="text-slate-200">{a.actorName || 'System'}</strong>
                </div>
                {a.beforeSummary && a.afterSummary && (
                  <div className="text-[10px] text-slate-500">
                    <span>{a.beforeSummary}</span> ➔ <span className="text-slate-300">{a.afterSummary}</span>
                  </div>
                )}
                {a.reason && (
                  <div className="text-[11px] text-amber-300/80 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
                    Reason: {a.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protected Permanent Deletion Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertOctagon className="w-5 h-5" />
              <h4 className="font-bold text-base">Protected Permanent Deletion</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Permanent deletion cannot be undone. Per company compliance rules, you must document a valid justification for this audit entry.
            </p>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Audit Justification (Required):
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder="e.g. End of client contract and audited by board"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setDeleteTargetId(null)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                Execute Controlled Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

