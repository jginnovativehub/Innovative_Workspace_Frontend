import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { User, Project, Milestone, Task, WeeklyReport, DashboardMetrics } from '../../types';
import { 
  Crown, Briefcase, Plus, CheckCircle2, AlertTriangle, 
  Clock, ShieldCheck, ChevronRight, FileText, Send, 
  ExternalLink, Sparkles, TrendingUp, Compass, Target,
  UserPlus, X, Edit2, Trash2
} from 'lucide-react';
import { toast } from '../../context/ToastContext';

interface CeoDashboardProps {
  currentUser: User;
  projects: Project[];
  metrics: DashboardMetrics;
  weeklyReports: WeeklyReport[];
  tasks: Task[];
  onOpenProjectWizard: () => void;
  onOpenWeeklyReportModal: (report: WeeklyReport | null) => void;
  onSelectMilestoneForReview: (m: Milestone) => void;
  onCreateUser?: (data: any) => Promise<void>;
  onEditProject?: (p: Project) => void;
  onDeleteProject?: (p: Project) => void;
}

export const CeoDashboard: React.FC<CeoDashboardProps> = ({
  currentUser,
  projects,
  metrics,
  weeklyReports,
  tasks,
  onOpenProjectWizard,
  onOpenWeeklyReportModal,
  onSelectMilestoneForReview,
  onCreateUser,
  onEditProject,
  onDeleteProject
}) => {
  const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'SIGN_OFFS' | 'MY_DELIVERABLES'>('PORTFOLIO');

  // CEO User Provisioning Modal state (can create COO or EMPLOYEE)
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionName, setProvisionName] = useState('');
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisionPassword, setProvisionPassword] = useState('Welcome2026!');
  const [provisionRole, setProvisionRole] = useState<'COO' | 'EMPLOYEE'>('EMPLOYEE');
  const [provisionDept, setProvisionDept] = useState('Engineering');
  const [isProvisioning, setIsProvisioning] = useState(false);

  // CEO's own tasks
  const myTasks = tasks.filter(t => t.ownerId === currentUser.id);

  // Milestones awaiting executive sign-off
  const milestonesForSignOff = projects.flatMap(p => 
    (p.milestones || []).filter(m => m.status === 'SUBMITTED_FOR_REVIEW')
  );

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionName || !provisionEmail || !provisionPassword || !onCreateUser) return;
    setIsProvisioning(true);
    try {
      await onCreateUser({
        fullName: provisionName,
        email: provisionEmail,
        password: provisionPassword,
        role: provisionRole,
        department: provisionDept
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setShowProvisionModal(false);
      setProvisionName('');
      setProvisionEmail('');
      setProvisionPassword('Welcome2026!');
      toast.success(`Successfully provisioned ${provisionName} as ${provisionRole}!`, 'Team Member Provisioned');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user', 'Provisioning Failed');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CEO Strategic Leadership Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                CEO STRATEGIC DASHBOARD
              </span>
              <span className="text-xs text-slate-400">Executive Portfolio & Vision</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Enterprise Portfolio & Strategic Health</h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Strategic leadership, portfolio milestone completion rates, executive acceptance sign-offs, and personal executive accountability.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {onCreateUser && (
              <button
                onClick={() => setShowProvisionModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-950/80 hover:bg-purple-900/90 border border-purple-500/50 text-purple-200 shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>Provision Team Member</span>
              </button>
            )}
            <button
              onClick={onOpenProjectWizard}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Launch New Project Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strategic KPI Metric Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Milestone Progress</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white">{metrics.milestoneCompletionRate}%</span>
            <span className="text-xs text-slate-400 font-mono">({metrics.approvedMilestones}/{metrics.totalMilestones})</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${metrics.milestoneCompletionRate}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Task Delivery</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white">{metrics.taskCompletionRate}%</span>
            <span className="text-xs text-slate-400 font-mono">({metrics.completedTasks}/{metrics.totalTasks})</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metrics.taskCompletionRate}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Sign-Off Gates Pending</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400">{milestonesForSignOff.length}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Awaiting executive acceptance</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Roadblocks</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className={`text-2xl font-black ${metrics.blockedCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {metrics.blockedCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Requiring management support</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PORTFOLIO')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'PORTFOLIO' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Strategic Portfolio ({projects.length} Projects)</span>
        </button>

        <button
          onClick={() => setActiveTab('SIGN_OFFS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'SIGN_OFFS' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Executive Sign-Off Gates ({milestonesForSignOff.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_DELIVERABLES')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'MY_DELIVERABLES' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>CEO Personal Work & Weekly Report</span>
        </button>
      </div>

      {/* TAB 1: STRATEGIC PORTFOLIO */}
      {activeTab === 'PORTFOLIO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Active Product Portfolio Roadmap</h3>
              <p className="text-xs text-slate-400">High-level visibility into deliverables, timelines, and stage-gate progression.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
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
                    <span className="font-bold text-purple-400 font-mono">{p.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${p.progressPercentage}%` }} />
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
        </div>
      )}

      {/* TAB 2: EXECUTIVE SIGN-OFF GATES */}
      {activeTab === 'SIGN_OFFS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Milestone Verification Gate (Executive Review)</h3>
              <p className="text-xs text-slate-400">Inspect deliverable test evidence, verify acceptance criteria, and approve milestone completion.</p>
            </div>
          </div>

          {milestonesForSignOff.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center text-slate-500 text-xs">
              Zero milestones currently waiting for executive sign-off.
            </div>
          ) : (
            <div className="space-y-3">
              {milestonesForSignOff.map(m => (
                <div key={m.id} className="bg-slate-900/60 border border-amber-500/40 rounded-xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Stage {m.sequence}
                        </span>
                        <h4 className="font-bold text-base text-white">{m.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 block">Owner: {m.ownerName}</span>
                    </div>

                    <button
                      onClick={() => onSelectMilestoneForReview(m)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Conduct Executive Review Gate</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                    <strong className="text-purple-400 block mb-0.5">Formal Acceptance Standard:</strong>
                    {m.acceptanceCriteria}
                  </div>

                  {m.evidenceNotes && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg text-xs">
                      <strong className="text-emerald-400 block mb-0.5">Submitted Verification Evidence:</strong>
                      <p className="text-emerald-200">{m.evidenceNotes}</p>
                      {m.evidenceUrl && (
                        <a href={m.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-cyan-400 font-medium mt-1">
                          <span>Open Deliverable Package</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CEO PERSONAL WORK & WEEKLY REPORT */}
      {activeTab === 'MY_DELIVERABLES' && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">CEO Personal Weekly Report</h3>
                <p className="text-xs text-slate-400">
                  CEO records personal strategic deliverables and submits weekly progress reports just like any other company contributor.
                </p>
              </div>
              <button
                onClick={() => onOpenWeeklyReportModal(null)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Strategic Report</span>
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

      {/* CEO Team Member Provisioning Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Provision Team Member</h3>
                  <p className="text-[11px] text-purple-300">CEO Executive Staffing Authorization</p>
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
              As CEO, you have executive authority to provision new <strong>Chief Operating Officer (COO)</strong> leadership 
              or project <strong>Employees</strong> into the organizational hierarchy.
            </p>

            <form onSubmit={handleProvisionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={provisionName}
                  onChange={e => setProvisionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="rachel.adams@jginnovative.com"
                  value={provisionEmail}
                  onChange={e => setProvisionEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hierarchical Role</label>
                  <select
                    value={provisionRole}
                    onChange={e => setProvisionRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    <option value="EMPLOYEE">User (Employee)</option>
                    <option value="COO">COO (Operations Lead)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={provisionDept}
                    onChange={e => setProvisionDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-600/30"
                >
                  {isProvisioning ? 'Authorizing & Creating...' : 'Provision Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

