import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { User, Project, Milestone, Task, WeeklyReport, DashboardMetrics } from '../../types';
import { 
  Crown, Briefcase, Plus, CheckCircle2, AlertTriangle, 
  Clock, ShieldCheck, ChevronRight, FileText, Send, 
  ExternalLink, Sparkles, TrendingUp, Compass, Target,
  UserPlus, X, Edit2, Trash2, Lock
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import { PersonalProjectTracker } from '../PersonalProjectTracker';
import { ExpeditionRoadmapModal } from '../ExpeditionRoadmapModal';

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
  const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'SIGN_OFFS' | 'MY_DELIVERABLES' | 'PERSONAL_PROJECTS'>('PORTFOLIO');
  const [roadmapProject, setRoadmapProject] = useState<Project | null>(null);

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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/10 text-purple-800 border border-purple-200">
              CEO Dashboard
            </span>
            <span className="text-xs text-gray-600">Executive Portfolio & Vision</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Enterprise Portfolio & Strategic Health</h1>
          <p className="text-xs text-gray-600 max-w-2xl">
            Strategic leadership, portfolio milestone completion rates, executive acceptance sign-offs, and personal executive accountability.
          </p>
        </div>

          <div className="flex items-center space-x-3 shrink-0">
            {onCreateUser && (
              <button
                onClick={() => setShowProvisionModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-purple-50 border border-gray-300 hover:border-purple-300 text-gray-700 hover:text-purple-700 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4 text-purple-600" />
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

      {/* Strategic KPI Metric Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Milestone Progress</span>
            <Target className="w-4 h-4 text-purple-700" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-gray-900">{metrics.milestoneCompletionRate}%</span>
            <span className="text-xs text-gray-600 font-mono">({metrics.approvedMilestones}/{metrics.totalMilestones})</span>
          </div>
          <div className="w-full bg-gray-50 h-1 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${metrics.milestoneCompletionRate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Task Delivery</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-gray-900">{metrics.taskCompletionRate}%</span>
            <span className="text-xs text-gray-600 font-mono">({metrics.completedTasks}/{metrics.totalTasks})</span>
          </div>
          <div className="w-full bg-gray-50 h-1 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metrics.taskCompletionRate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Sign-Off Gates Pending</span>
            <ShieldCheck className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-2xl font-black text-amber-700">{milestonesForSignOff.length}</span>
          <span className="text-[10px] text-gray-600 block mt-1">Awaiting executive acceptance</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Roadblocks</span>
            <AlertTriangle className="w-4 h-4 text-rose-700" />
          </div>
          <span className={`text-2xl font-black ${metrics.blockedCount > 0 ? 'text-rose-700' : 'text-gray-700'}`}>
            {metrics.blockedCount}
          </span>
          <span className="text-[10px] text-gray-600 block mt-1">Requiring management support</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PORTFOLIO')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'PORTFOLIO' ? 'border-purple-600 text-purple-700 font-bold' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Strategic Portfolio ({projects.length} Projects)</span>
        </button>

        <button
          onClick={() => setActiveTab('SIGN_OFFS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'SIGN_OFFS' ? 'border-purple-600 text-purple-700 font-bold' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Executive Sign-Off Gates ({milestonesForSignOff.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_DELIVERABLES')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'MY_DELIVERABLES' ? 'border-purple-600 text-purple-700 font-bold' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>CEO Personal Work & Weekly Report</span>
        </button>

        <button
          onClick={() => setActiveTab('PERSONAL_PROJECTS')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'PERSONAL_PROJECTS' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-700" />
          <span>🔒 Personal Project Tracker</span>
        </button>
      </div>

      {/* TAB 1: STRATEGIC PORTFOLIO */}
      {activeTab === 'PORTFOLIO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Active Product Portfolio Roadmap</h3>
              <p className="text-xs text-gray-600">High-level visibility into deliverables, timelines, and stage-gate progression.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-700 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-200">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-base text-gray-900">{p.name}</h4>
                    </div>
                    <span className="text-xs text-gray-600 mt-1 block">Owner: {p.ownerName}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{p.objective}</p>

                {/* Progress Bar & Denominator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Milestones Conquered: <strong className="text-gray-800">{p.completedMilestones} of {p.milestonesCount}</strong></span>
                    <span className="font-bold text-purple-700 font-mono">{p.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${p.progressPercentage}%` }} />
                  </div>
                </div>

                {/* Milestones Quick List */}
                <div className="pt-2 border-t border-gray-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                    Expedition Milestones:
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {(p.milestones || []).map(m => (
                      <div key={m.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-white/60 border border-slate-850">
                        <span className="text-gray-700 truncate max-w-[240px]">
                          {m.sequence}. {m.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          m.status === 'APPROVED_COMPLETED' ? 'text-emerald-700 border-emerald-200 bg-emerald-500/10' :
                          m.status === 'SUBMITTED_FOR_REVIEW' ? 'text-amber-700 border-amber-200 bg-amber-500/10' :
                          m.status === 'BLOCKED' ? 'text-rose-700 border-rose-200 bg-rose-500/10' :
                          'text-gray-600 border-gray-200 bg-white'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Actions */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setRoadmapProject(p)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition-all cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Expedition Roadmap</span>
                  </button>
                  {onEditProject && (
                    <button
                      onClick={() => onEditProject(p)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Plan</span>
                    </button>
                  )}
                  {onDeleteProject && (
                    <button
                      onClick={() => onDeleteProject(p)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
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
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Milestone Verification Gate (Executive Review)</h3>
              <p className="text-xs text-gray-600">Inspect deliverable test evidence, verify acceptance criteria, and approve milestone completion.</p>
            </div>
          </div>

          {milestonesForSignOff.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-600 text-xs">
              Zero milestones currently waiting for executive sign-off.
            </div>
          ) : (
            <div className="space-y-3">
              {milestonesForSignOff.map(m => (
                <div key={m.id} className="bg-white border border-amber-500/40 rounded-xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Stage {m.sequence}
                        </span>
                        <h4 className="font-bold text-base text-gray-900">{m.title}</h4>
                      </div>
                      <span className="text-xs text-gray-600 mt-0.5 block">Owner: {m.ownerName}</span>
                    </div>

                    <button
                      onClick={() => onSelectMilestoneForReview(m)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Conduct Executive Review Gate</span>
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs font-mono text-gray-700">
                    <strong className="text-purple-700 block mb-0.5">Formal Acceptance Standard:</strong>
                    {m.acceptanceCriteria}
                  </div>

                  {m.evidenceNotes && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs">
                      <strong className="text-emerald-700 block mb-0.5">Submitted Verification Evidence:</strong>
                      <p className="text-emerald-900">{m.evidenceNotes}</p>
                      {m.evidenceUrl && (
                        <a href={m.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-blue-700 font-medium mt-1">
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
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-gray-900">CEO Personal Weekly Report</h3>
                <p className="text-xs text-gray-600">
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
                <div key={r.id} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Period: {r.periodStart} to {r.periodEnd}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {r.status} • Version {r.currentVersion}
                    </span>
                  </div>
                  {r.versions?.[0] && (
                    <div className="text-gray-700 space-y-1">
                      <p><strong className="text-emerald-700">Completed:</strong> {r.versions[0].completedThisWeek}</p>
                      <p><strong className="text-indigo-700">Next Plan:</strong> {r.versions[0].nextWeekPlan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERSONAL PROJECTS TRACKER (Strictly Private) */}
      {activeTab === 'PERSONAL_PROJECTS' && (
        <PersonalProjectTracker currentUser={currentUser} />
      )}

      {/* CEO Team Member Provisioning Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-purple-500/40 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Provision Team Member</h3>
                  <p className="text-[11px] text-purple-800">CEO Executive Staffing Authorization</p>
                </div>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-700">
              As CEO, you have executive authority to provision new <strong>Chief Operating Officer (COO)</strong> leadership 
              or project <strong>Employees</strong> into the organizational hierarchy.
            </p>

            <form onSubmit={handleProvisionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={provisionName}
                  onChange={e => setProvisionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="rachel.adams@jginnovative.com"
                  value={provisionEmail}
                  onChange={e => setProvisionEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hierarchical Role</label>
                  <select
                    value={provisionRole}
                    onChange={e => setProvisionRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    <option value="EMPLOYEE">User (Employee)</option>
                    <option value="COO">COO (Operations Lead)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={provisionDept}
                    onChange={e => setProvisionDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={provisionPassword}
                  onChange={e => setProvisionPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-900 hover:text-gray-900"
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
      {/* Interactive Expedition Roadmap Modal for CEO Executive Leadership */}
      <ExpeditionRoadmapModal
        isOpen={Boolean(roadmapProject)}
        onClose={() => setRoadmapProject(null)}
        project={roadmapProject}
        currentUser={currentUser}
        onReviewMilestone={onSelectMilestoneForReview}
      />
    </div>
  );
};


