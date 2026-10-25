import React, { useState } from 'react';
import { User, Project, Milestone, Task, WeeklyReport } from '../../types';
import { QuestMap } from '../QuestMap';
import { 
  CheckSquare, FileText, Sparkles, ShieldAlert, Clock, 
  Plus, Send, Calendar, Check, AlertTriangle, Flame, 
  ExternalLink, ChevronRight, Award, FolderKanban, Users, 
  Layers, ArrowRight, UserCheck, CheckCircle2, ChevronDown
} from 'lucide-react';

interface EmployeeDashboardProps {
  currentUser: User;
  projects: Project[];
  selectedProject: Project | null;
  tasks: Task[];
  weeklyReports: WeeklyReport[];
  onSelectProject: (id: number) => void;
  onOpenBlockerModal: (t: Task) => void;
  onOpenScheduleModal: (t: Task) => void;
  onSubmitTaskForReview: (taskId: number) => void;
  onSubmitMilestoneForReview: (m: Milestone) => void;
  onOpenWeeklyReportModal: (r: WeeklyReport | null) => void;
  onOpenLeaderboard: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  projects,
  selectedProject,
  tasks,
  weeklyReports,
  onSelectProject,
  onOpenBlockerModal,
  onOpenScheduleModal,
  onSubmitTaskForReview,
  onSubmitMilestoneForReview,
  onOpenWeeklyReportModal,
  onOpenLeaderboard
}) => {
  const [activeTab, setActiveTab] = useState<'MY_PROJECTS' | 'QUEST_MAP' | 'MY_TASKS' | 'MY_REPORTS'>('MY_PROJECTS');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'IN_PROGRESS' | 'BLOCKED' | 'SUBMITTED' | 'DONE'>('ALL');

  // Filter tasks belonging to current user or permitted projects
  const myTasks = tasks.filter(t => t.ownerId === currentUser.id);
  const myReports = weeklyReports.filter(r => r.userId === currentUser.id);

  const filteredTasks = myTasks.filter(t => {
    if (taskFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED';
    if (taskFilter === 'BLOCKED') return t.status === 'BLOCKED';
    if (taskFilter === 'SUBMITTED') return t.status === 'SUBMITTED_FOR_REVIEW';
    if (taskFilter === 'DONE') return t.status === 'APPROVED_COMPLETED';
    return true;
  });

  const activeBlockedCount = myTasks.filter(t => t.status === 'BLOCKED').length;
  const inProgressCount = myTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const completedCount = myTasks.filter(t => t.status === 'APPROVED_COMPLETED').length;

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Employee Personal Mission Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                ENGINEERING CONTRIBUTOR DASHBOARD
              </span>
              <span className="text-xs text-slate-400">Personal Workspace & Assigned Projects</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Active Deliverables & Engineering Mission</h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Track your assigned projects, milestone stages, deliverable evidence, blockers with mitigation steps, and weekly performance reviews.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onOpenWeeklyReportModal(null)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Submit Weekly Report (+50 XP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contributor Mission Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Assigned Initiatives</span>
            <FolderKanban className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white">{projects.length}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Active project scopes</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress Tasks</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white">{inProgressCount}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Active assigned deliverables</span>
        </div>

        <div className={`border rounded-xl p-4 ${
          activeBlockedCount > 0 ? 'bg-rose-950/20 border-rose-500/40' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">My Blockers</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className={`text-2xl font-black ${activeBlockedCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {activeBlockedCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Escalated to management</span>
        </div>

        <div 
          onClick={onOpenLeaderboard}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 cursor-pointer hover:bg-amber-500/20 transition-all"
        >
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Innovation XP</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-white font-mono">{currentUser.xp}</span>
            <span className="text-xs text-amber-400 font-bold">XP</span>
          </div>
          <span className="text-[10px] text-slate-300 block mt-1">Level {currentUser.level} • {currentUser.avatarTitle}</span>
        </div>
      </div>

      {/* Quick Project Switcher Header */}
      {projects.length > 0 && (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <FolderKanban className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Quick Project Switcher ({projects.length} Assigned)
              </h2>
            </div>
            {selectedProject && (
              <span className="text-[11px] text-slate-400">
                Active Selection: <strong className="text-emerald-300">{selectedProject.name}</strong> ({selectedProject.code})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map(p => {
              const isSelected = String(selectedProject?.id) === String(p.id);
              const isLead = Number(p.ownerId) === Number(currentUser.id);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(Number(p.id))}
                  className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {p.code}
                      </span>
                      <div className="flex items-center space-x-1">
                        {isLead ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Lead / Owner
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Contributor
                          </span>
                        )}
                        {getPriorityBadge(p.priority)}
                      </div>
                    </div>
                    <h3 className="text-xs font-bold text-white truncate">{p.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{p.objective}</p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{p.milestonesCount ?? (p.milestones?.length || 0)} Milestones</span>
                    {isSelected ? (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Active View</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 hover:text-slate-300">Click to Select</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('MY_PROJECTS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MY_PROJECTS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Assigned Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUEST_MAP')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'QUEST_MAP' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Milestone Quest Map</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_TASKS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MY_TASKS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>My Assigned Tasks ({myTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_REPORTS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'MY_REPORTS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Weekly Reports ({myReports.length})</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED INITIATIVES (MY_PROJECTS) */}
      {activeTab === 'MY_PROJECTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Assigned Initiatives & Engineering Scopes</h3>
              <p className="text-xs text-slate-400">
                Initiatives provisioned in the governance console where you are designated as Project Lead or Team Contributor.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total: <strong className="text-white">{projects.length}</strong>
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Initiatives Assigned Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You are not currently assigned to any active engineering projects. Once an administrator or executive creates an initiative and designates you as owner or contributor, it will immediately appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(p => {
                const isSelected = String(selectedProject?.id) === String(p.id);
                const isLead = Number(p.ownerId) === Number(currentUser.id);
                const milestonesCount = p.milestonesCount ?? (p.milestones?.length || 0);
                const tasksCount = p.tasksCount ?? 0;
                const progress = p.progressPercentage ?? 0;

                return (
                  <div
                    key={p.id}
                    className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all ${
                      isSelected 
                        ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {p.code}
                            </span>
                            {getPriorityBadge(p.priority)}
                            {isLead ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Lead / Owner
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Contributor
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-base text-white">{p.name}</h4>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded border shrink-0 ${
                          p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          p.status === 'COMPLETED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {p.objective}
                      </p>

                      {p.scope && (
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                          <span className="text-slate-400 font-bold block mb-0.5">Scope:</span>
                          <p className="text-slate-300 line-clamp-2">{p.scope}</p>
                        </div>
                      )}

                      {/* Initiative Meta & Team */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Target: <strong className="text-slate-300 font-normal">{p.targetDate}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Lead: <strong className="text-slate-300 font-normal">{p.ownerName || 'Leadership'}</strong></span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Delivery Progress ({milestonesCount} Milestones • {tasksCount} Tasks)</span>
                          <span className="font-mono text-emerald-400 font-bold">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onSelectProject(Number(p.id));
                          setActiveTab('MY_TASKS');
                        }}
                        className="cursor-pointer px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        View Tasks
                      </button>

                      <button
                        onClick={() => {
                          onSelectProject(Number(p.id));
                          setActiveTab('QUEST_MAP');
                        }}
                        className="cursor-pointer flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <span>Open Quest Map</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUEST MAP */}
      {activeTab === 'QUEST_MAP' && (
        <div className="space-y-4">
          {/* Active Project Banner */}
          {selectedProject && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {selectedProject.code}
                  </span>
                  <h3 className="text-sm font-bold text-white">{selectedProject.name}</h3>
                  {getPriorityBadge(selectedProject.priority)}
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{selectedProject.objective}</p>
              </div>

              {projects.length > 1 && (
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs text-slate-400">Switch:</span>
                  <select
                    value={selectedProject.id}
                    onChange={(e) => onSelectProject(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Render QuestMap or empty state if no milestones */}
          {selectedProject && selectedProject.milestones && selectedProject.milestones.length > 0 ? (
            <QuestMap
              milestones={selectedProject.milestones}
              currentUser={currentUser}
              onSelectMilestone={() => {}}
              onSubmitForReview={onSubmitMilestoneForReview}
              onReviewMilestone={() => {}}
            />
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">
                  Initiative Initialized: {selectedProject?.name || 'Assigned Initiative'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Project <strong className="text-emerald-300">{selectedProject?.code}</strong> is active. You are assigned to this initiative as{' '}
                  <strong className="text-amber-300">
                    {Number(selectedProject?.ownerId) === Number(currentUser.id) ? 'Initiative Lead / Owner' : 'Team Contributor'}
                  </strong>.
                </p>
                <p className="text-xs text-slate-500 pt-1">
                  Milestones and expedition stage-gate criteria have not been scheduled yet. Work breakdown structure will appear here as stages are scheduled.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
                <span className="font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  Target Date: <strong className="text-slate-200">{selectedProject?.targetDate || 'TBD'}</strong>
                </span>
                <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  Lead: <strong className="text-slate-200">{selectedProject?.ownerName || 'Assigned'}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY ASSIGNED TASKS */}
      {activeTab === 'MY_TASKS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">My Work Items & Deliverables</h3>
              <p className="text-xs text-slate-400">Update status, submit completed deliverables with evidence, or report blockers.</p>
            </div>

            <div className="flex items-center space-x-2">
              {(['ALL', 'IN_PROGRESS', 'BLOCKED', 'SUBMITTED', 'DONE'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    taskFilter === filter 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
              <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Tasks in this Category</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {taskFilter === 'ALL' 
                  ? 'You currently have no tasks assigned to you across initiatives.' 
                  : `No tasks currently match the "${taskFilter}" filter.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(t => {
                const isBlocked = t.status === 'BLOCKED';
                const isSubmitted = t.status === 'SUBMITTED_FOR_REVIEW';
                const isDone = t.status === 'APPROVED_COMPLETED';

                return (
                  <div
                    key={t.id}
                    className={`bg-slate-900/70 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                      isBlocked ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' :
                      isSubmitted ? 'border-amber-500/40 shadow-lg shadow-amber-500/10' :
                      isDone ? 'border-emerald-500/30' :
                      'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                          t.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          t.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {t.priority}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isDone ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          isSubmitted ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
                          isBlocked ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white">{t.title}</h4>
                      {t.description && (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{t.description}</p>
                      )}

                      <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <span>Milestone:</span>
                          <span className="font-semibold text-slate-200">{t.milestoneTitle}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Due Date:</span>
                          <span className="font-mono text-slate-300">{t.dueDate}</span>
                        </div>
                      </div>

                      {isBlocked && (
                        <div className="bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl text-xs space-y-1">
                          <div className="flex items-center space-x-1 text-rose-400 font-bold">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Active Blocker Under Triage</span>
                          </div>
                          {t.updates?.[0]?.impact && (
                            <p className="text-rose-200 text-[11px]">Impact: {t.updates[0].impact}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onOpenBlockerModal(t)}
                          className="cursor-pointer px-2 py-1 rounded text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        >
                          Report Blocker
                        </button>
                        <button
                          onClick={() => onOpenScheduleModal(t)}
                          className="cursor-pointer px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        >
                          Reschedule
                        </button>
                      </div>

                      {!isDone && !isSubmitted && (
                        <button
                          onClick={() => onSubmitTaskForReview(t.id)}
                          className="cursor-pointer px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                        >
                          Submit (+{t.xpReward} XP)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY WEEKLY REPORTS (Strict Privacy) */}
      {activeTab === 'MY_REPORTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">My Weekly Progress Reports</h3>
              <p className="text-xs text-slate-400">
                Strictly private workspace. Your reports and revision history are visible only to you and designated reviewers.
              </p>
            </div>
            <button
              onClick={() => onOpenWeeklyReportModal(null)}
              className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose Weekly Report</span>
            </button>
          </div>

          {myReports.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Weekly Reports Filed</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Submit your weekly progress summary to earn 50 Innovation XP and keep leadership updated.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.map(r => (
                <div key={r.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">Reporting Period: {r.periodStart} to {r.periodEnd}</h4>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Version {r.currentVersion} • Submitted {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded border ${
                        r.status === 'REVIEWED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        r.status === 'CHANGES_REQUESTED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        r.status === 'SUBMITTED' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {r.status}
                      </span>
                      <button
                        onClick={() => onOpenWeeklyReportModal(r)}
                        className="cursor-pointer px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      >
                        Inspect / Edit
                      </button>
                    </div>
                  </div>

                  {r.reviewerFeedback && (
                    <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl text-xs">
                      <strong className="text-amber-400 block mb-0.5">Reviewer Feedback:</strong>
                      <p className="text-amber-200 font-mono">{r.reviewerFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
