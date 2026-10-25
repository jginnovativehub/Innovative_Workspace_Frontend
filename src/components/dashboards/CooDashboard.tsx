import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { User, Project, Milestone, Task, WeeklyReport, DashboardMetrics, ScheduleChangeRequest } from '../../types';
import { 
  Inbox, ShieldAlert, CheckCircle2, Clock, Users, 
  FileCheck, Calendar, AlertTriangle, ChevronRight, 
  Plus, ExternalLink, ShieldCheck, Check, X, RefreshCw,
  UserPlus, Briefcase, Edit2, Trash2
} from 'lucide-react';
import { toast } from '../../context/ToastContext';

interface CooDashboardProps {
  currentUser: User;
  projects: Project[];
  metrics: DashboardMetrics;
  tasks: Task[];
  weeklyReports: WeeklyReport[];
  users: User[];
  reviewInboxData: any;
  onOpenReviewInbox: () => void;
  onOpenWeeklyReportModal: (report: WeeklyReport | null) => void;
  onReviewWeeklyReport: (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string) => Promise<void>;
  onReviewSchedule: (id: number, status: 'APPROVED' | 'REJECTED', notes: string) => Promise<void>;
  onCreateUser?: (data: any) => Promise<void>;
  onOpenProjectWizard?: () => void;
  onEditProject?: (p: Project) => void;
  onDeleteProject?: (p: Project) => void;
}

export const CooDashboard: React.FC<CooDashboardProps> = ({
  currentUser,
  projects,
  metrics,
  tasks,
  weeklyReports,
  users,
  reviewInboxData,
  onOpenReviewInbox,
  onOpenWeeklyReportModal,
  onReviewWeeklyReport,
  onReviewSchedule,
  onCreateUser,
  onOpenProjectWizard,
  onEditProject,
  onDeleteProject
}) => {
  const [activeTab, setActiveTab] = useState<'REVIEW_QUEUE' | 'PROJECTS' | 'BLOCKERS' | 'COMPLIANCE' | 'MY_WORK'>('REVIEW_QUEUE');

  // COO User Provisioning Modal state (can create EMPLOYEE)
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionName, setProvisionName] = useState('');
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisionPassword, setProvisionPassword] = useState('Welcome2026!');
  const [provisionDept, setProvisionDept] = useState('Engineering');
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Filter tasks with blockers
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');

  // Employees list for compliance matrix
  const employees = users.filter(u => u.role === 'EMPLOYEE');

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionName || !provisionEmail || !provisionPassword || !onCreateUser) return;
    setIsProvisioning(true);
    try {
      await onCreateUser({
        fullName: provisionName,
        email: provisionEmail,
        password: provisionPassword,
        role: 'EMPLOYEE',
        department: provisionDept
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setShowProvisionModal(false);
      setProvisionName('');
      setProvisionEmail('');
      setProvisionPassword('Welcome2026!');
      toast.success(`Successfully provisioned contributor ${provisionName}!`, 'Contributor Provisioned');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create contributor', 'Provisioning Failed');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* COO Operations Command Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                COO OPERATIONS DASHBOARD
              </span>
              <span className="text-xs text-slate-400">Execution, Review Queues & Triage</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Operational Coordination & Delivery Command</h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Direct coordination of delivery teams, active blocker escalation triage, weekly reporting discipline, and deliverable review throughput.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {onCreateUser && (
              <button
                onClick={() => setShowProvisionModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-500/50 text-indigo-200 shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>Provision Contributor</span>
              </button>
            )}
            {onOpenProjectWizard && (
              <button
                onClick={onOpenProjectWizard}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Launch Project Plan</span>
              </button>
            )}
            <button
              onClick={onOpenReviewInbox}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Inbox className="w-4 h-4" />
              <span>Open Review Cockpit ({reviewInboxData?.totalBacklog || 0})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational KPI Metric Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Review Backlog</span>
            <Inbox className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white">{metrics.reviewBacklogCount}</span>
          <span className="text-[10px] text-indigo-300 block mt-1">Pending operational sign-offs</span>
        </div>

        <div className={`border rounded-xl p-4 ${
          blockedTasks.length > 0 ? 'bg-rose-950/20 border-rose-500/40' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Blockers</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className={`text-2xl font-black ${blockedTasks.length > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {blockedTasks.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Requiring immediate resolution</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Report Compliance</span>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-cyan-400">{metrics.weeklyReportComplianceRate}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Engineering active staff</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Alerts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className={`text-2xl font-black ${metrics.overdueCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {metrics.overdueCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Tasks past due date</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('REVIEW_QUEUE')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'REVIEW_QUEUE' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Operational Review Queue ({reviewInboxData?.totalBacklog || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROJECTS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'PROJECTS' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Project Delivery Plans ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BLOCKERS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'BLOCKERS' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Blocker Triage & Support ({blockedTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'COMPLIANCE' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Workload & Weekly Compliance</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_WORK')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'MY_WORK' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>COO Personal Work & Report</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONAL REVIEW QUEUE */}
      {activeTab === 'REVIEW_QUEUE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Pending Operational Approvals</h3>
              <p className="text-xs text-slate-400">Review weekly progress submissions, milestone acceptance tests, and proposed schedule changes.</p>
            </div>
            <button
              onClick={onOpenReviewInbox}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Open Full Modal Cockpit ➔
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Reports to Review */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Weekly Reports Waiting Review</span>
                <span className="text-indigo-400 font-mono">{reviewInboxData?.pendingReports?.length || 0}</span>
              </h4>
              <div className="space-y-2">
                {(reviewInboxData?.pendingReports || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Zero weekly reports pending review.</p>
                ) : (
                  (reviewInboxData?.pendingReports || []).map((r: WeeklyReport) => (
                    <div key={r.id} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{r.userName}</span>
                        <span className="text-[11px] text-slate-400">Period: {r.periodStart} to {r.periodEnd}</span>
                      </div>
                      <button
                        onClick={onOpenReviewInbox}
                        className="px-2.5 py-1 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold text-[11px]"
                      >
                        Review
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Schedule Change Requests to Audit */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Schedule Change Audits</span>
                <span className="text-amber-400 font-mono">{reviewInboxData?.pendingSchedules?.length || 0}</span>
              </h4>
              <div className="space-y-2">
                {(reviewInboxData?.pendingSchedules || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Zero schedule changes pending approval.</p>
                ) : (
                  (reviewInboxData?.pendingSchedules || []).map((sq: any) => (
                    <div key={sq.id} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate max-w-[200px]">{sq.taskTitle}</span>
                        <span className="text-slate-400 text-[11px]">{sq.requesterName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="line-through text-slate-500">{sq.oldDueDate}</span>
                        <span>➔</span>
                        <span className="font-bold text-cyan-300 font-mono">{sq.newDueDate}</span>
                      </div>
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          onClick={() => onReviewSchedule(sq.id, 'REJECTED', 'Extension declined')}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onReviewSchedule(sq.id, 'APPROVED', 'Approved extension')}
                          className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-sm"
                        >
                          Approve Extension
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROJECT DELIVERY PLANS */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Active Project Delivery Plans</h3>
              <p className="text-xs text-slate-400">Milestone delivery roadmaps, stage-gate progression, and engineering deliverables.</p>
            </div>
            {onOpenProjectWizard && (
              <button
                onClick={onOpenProjectWizard}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Launch Project Plan</span>
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center space-y-3">
              <Briefcase className="w-8 h-8 text-indigo-400 mx-auto opacity-50" />
              <p className="text-xs text-slate-400">No active project plans configured in the system yet.</p>
              {onOpenProjectWizard && (
                <button
                  onClick={onOpenProjectWizard}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch First Project Plan</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(p => (
                <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                          {p.code}
                        </span>
                        <h4 className="font-bold text-base text-white">{p.name}</h4>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">Owner: {p.ownerName}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{p.objective}</p>

                  {/* Progress Bar & Denominator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Milestones Conquered: <strong className="text-slate-200">{p.completedMilestones} of {p.milestonesCount}</strong></span>
                      <span className="font-bold text-indigo-400 font-mono">{p.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${p.progressPercentage}%` }} />
                    </div>
                  </div>

                  {/* Milestones Quick List */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Expedition Milestones:
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {(p.milestones || []).map(m => (
                        <div key={m.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950/60 border border-slate-850">
                          <span className="text-slate-300 truncate max-w-[240px]">
                            {m.sequence}. {m.title}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            m.status === 'APPROVED_COMPLETED' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                            m.status === 'SUBMITTED_FOR_REVIEW' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                            m.status === 'BLOCKED' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                            'text-slate-400 border-slate-800 bg-slate-900'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                    {onEditProject && (
                      <button
                        onClick={() => onEditProject(p)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Plan</span>
                      </button>
                    )}
                    {onDeleteProject && (
                      <button
                        onClick={() => onDeleteProject(p)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BLOCKER TRIAGE & SUPPORT */}
      {activeTab === 'BLOCKERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Active Impediments & Critical Blockers</h3>
              <p className="text-xs text-slate-400">
                Active blocker escalation protocol detailing reason, impact, recovery solution, expected resolution, and required management support.
              </p>
            </div>
          </div>

          {blockedTasks.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center text-slate-500 text-xs">
              Zero blockers currently reported. Delivery path is clear!
            </div>
          ) : (
            <div className="space-y-4">
              {blockedTasks.map(t => {
                const update = t.updates?.find(u => u.isBlocker) || t.updates?.[0];
                return (
                  <div key={t.id} className="bg-slate-900/80 border border-rose-500/40 rounded-2xl p-5 space-y-3 shadow-lg shadow-rose-500/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                            BLOCKED TASK
                          </span>
                          <h4 className="font-bold text-base text-white">{t.title}</h4>
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 block">
                          Milestone: {t.milestoneTitle} • Assignee: <strong className="text-slate-200">{t.ownerName}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-slate-400">Target: {t.dueDate}</span>
                      </div>
                    </div>

                    {update && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                          <div>
                            <strong className="text-rose-400 block mb-0.5">1. Blocker Cause:</strong>
                            <p className="text-slate-300">{update.blockerReason || update.note}</p>
                          </div>
                          <div>
                            <strong className="text-amber-400 block mb-0.5">2. Downstream Impact:</strong>
                            <p className="text-slate-300">{update.impact || 'Delays board fabrication'}</p>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                          <div>
                            <strong className="text-cyan-400 block mb-0.5">3. Proposed Recovery Plan:</strong>
                            <p className="text-slate-300">{update.proposedSolution || 'Source alternate part'}</p>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-850">
                            <div>
                              <strong className="text-indigo-400 block">4. Resolution Date:</strong>
                              <span className="text-slate-300 font-mono">{update.expectedResolutionDate || 'TBD'}</span>
                            </div>
                            <div className="text-right">
                              <strong className="text-emerald-400 block">5. Support Required:</strong>
                              <span className="text-slate-200 font-semibold">{update.supportNeeded || 'PO Authorization'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEAM WORKLOAD & REPORT COMPLIANCE */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Engineering Team Reporting Compliance Matrix</h3>
              <p className="text-xs text-slate-400">Visible submission discipline across active contributors.</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Contributor</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Active Tasks</th>
                  <th className="p-3.5">Weekly Report Status</th>
                  <th className="p-3.5">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map(emp => {
                  const empTasks = tasks.filter(t => t.ownerId === emp.id);
                  const empReport = weeklyReports.find(r => r.userId === emp.id);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-850/40">
                      <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                          {emp.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{emp.fullName}</span>
                      </td>
                      <td className="p-3.5 text-slate-400">{emp.department}</td>
                      <td className="p-3.5 font-mono">{empTasks.length} assigned</td>
                      <td className="p-3.5">
                        {empReport ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            empReport.status === 'REVIEWED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            empReport.status === 'CHANGES_REQUESTED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            empReport.status === 'SUBMITTED' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {empReport.status} (v{empReport.currentVersion})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            PENDING SUBMISSION
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-amber-400">{emp.streakCount}w Streak</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COO PERSONAL WORK & REPORT */}
      {activeTab === 'MY_WORK' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">COO Operational Deliverables & Weekly Report</h3>
                <p className="text-xs text-slate-400">
                  Record your own operational coordination tasks and submit weekly progress reports.
                </p>
              </div>
              <button
                onClick={() => onOpenWeeklyReportModal(null)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit COO Weekly Report</span>
              </button>
            </div>

            <div className="space-y-3">
              {weeklyReports.filter(r => r.userId === currentUser.id).map(r => (
                <div key={r.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Period: {r.periodStart} to {r.periodEnd}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {r.status} • Version {r.currentVersion}
                    </span>
                  </div>
                  {r.versions?.[0] && (
                    <div className="text-slate-300 space-y-1">
                      <p><strong className="text-emerald-400">Completed:</strong> {r.versions[0].completedThisWeek}</p>
                      <p><strong className="text-indigo-400">Next Plan:</strong> {r.versions[0].nextWeekPlan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COO Employee Provisioning Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Provision Delivery Contributor</h3>
                  <p className="text-[11px] text-indigo-300">COO Operational Staffing Access</p>
                </div>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              As COO, you have operational authority to onboard new project contributors and 
              <strong> Employees</strong> into delivery teams.
            </p>

            <form onSubmit={handleProvisionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Kim"
                  value={provisionName}
                  onChange={e => setProvisionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="david.kim@jginnovative.com"
                  value={provisionEmail}
                  onChange={e => setProvisionEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Assigned</label>
                  <input
                    type="text"
                    disabled
                    value="EMPLOYEE (User)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={provisionDept}
                    onChange={e => setProvisionDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={provisionPassword}
                  onChange={e => setProvisionPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/30"
                >
                  {isProvisioning ? 'Authorizing & Creating...' : 'Provision Contributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

