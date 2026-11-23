import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, Project, Milestone, Task, WeeklyReport, DashboardMetrics, 
  LeaderboardUser, Badge, NotificationItem, AuditEvent, SystemConfig 
} from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { CeoDashboard } from './components/dashboards/CeoDashboard';
import { CooDashboard } from './components/dashboards/CooDashboard';
import { EmployeeDashboard } from './components/dashboards/EmployeeDashboard';

import { LeaderboardModal } from './components/LeaderboardModal';
import { ReviewInboxModal } from './components/ReviewInboxModal';
import { ProjectWizardModal } from './components/ProjectWizardModal';
import { BlockerModal } from './components/BlockerModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { EditProjectModal } from './components/EditProjectModal';
import { DeleteProjectModal } from './components/DeleteProjectModal';
import { LogoutModal } from './components/LogoutModal';
import { LoginPage } from './components/LoginPage';
import { PersonalProjectTracker } from './components/PersonalProjectTracker';
import { AttendanceView } from './components/AttendanceView';

import { 
  Shield, Crown, Settings, User as UserIcon, RefreshCw, 
  Sparkles, ExternalLink, Calendar, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { toast } from './context/ToastContext';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [reviewInboxData, setReviewInboxData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isReviewInboxOpen, setIsReviewInboxOpen] = useState(false);
  const [isProjectWizardOpen, setIsProjectWizardOpen] = useState(false);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [selectedTaskForBlocker, setSelectedTaskForBlocker] = useState<Task | null>(null);
  const [isWeeklyReportModalOpen, setIsWeeklyReportModalOpen] = useState(false);
  const [selectedReportForEdit, setSelectedReportForEdit] = useState<WeeklyReport | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPersonalTrackerOpen, setIsPersonalTrackerOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  // Single Action Modals
  const [milestoneToSubmit, setMilestoneToSubmit] = useState<Milestone | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const [milestoneToReview, setMilestoneToReview] = useState<Milestone | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const [taskForScheduleChange, setTaskForScheduleChange] = useState<Task | null>(null);
  const [newDueDateInput, setNewDueDateInput] = useState('');
  const [scheduleReasonInput, setScheduleReasonInput] = useState('');

  // Initial boot: Check stored session or open Login Page first
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = localStorage.getItem('jg_auth_token');
      if (token) {
        try {
          const user = await api.getCurrentUser();
          if (user.role === 'ADMIN') {
            // Admin accounts belong to the dedicated Admin Portal
            api.logout();
            setCurrentUser(null);
            setIsInitializing(false);
            return;
          }
          setCurrentUser(user);
          await loadAllData(user);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          api.logout();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsInitializing(false);
    };
    checkExistingSession();
  }, []);

  // Real-Time Notification Stream & Fast Polling Synchronization
  useEffect(() => {
    if (!currentUser) return;

    // 1. Real-Time SSE Stream
    const closeStream = api.createNotificationStream((newNotif: NotificationItem) => {
      setNotifications(prev => {
        if (prev.some(n => String(n.id) === String(newNotif.id) || (n._id && newNotif._id && String(n._id) === String(newNotif._id)))) return prev;
        toast.info(newNotif.body, newNotif.title);
        return [newNotif, ...prev];
      });
    });

    // 2. 5-Second polling sync to keep multi-tab data fresh
    const pollInterval = setInterval(async () => {
      try {
        const freshNotifs = await api.getNotifications();
        setNotifications(prev => {
          return freshNotifs.map(fn => {
            const existing = prev.find(p => String(p.id) === String(fn.id) || (p._id && fn._id && String(p._id) === String(fn._id)));
            if (existing && existing.readAt && !fn.readAt) {
              return { ...fn, readAt: existing.readAt };
            }
            return fn;
          });
        });
      } catch (err) {
        // Continue silently
      }
    }, 5000);

    return () => {
      closeStream();
      clearInterval(pollInterval);
    };
  }, [currentUser]);

  const handleLoginSuccess = async (user: User) => {
    if (user.role === 'ADMIN') {
      toast.info('Administrator accounts must use the dedicated Admin Portal (/admin). Redirecting...', 'Dedicated Admin Console');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
      return;
    }
    setCurrentUser(user);
    await loadAllData(user);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setProjects([]);
    setTasks([]);
    setWeeklyReports([]);
  };

  const loadAllData = async (user: User) => {
    try {
      const [
        projsData, tasksData, reportsData, metricsData, notifsData,
        lbData, badgesData, allUsersData, cfgData
      ] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getWeeklyReports(),
        api.getDashboardMetrics(),
        api.getNotifications(),
        api.getLeaderboard(),
        api.getBadges(),
        api.getUsers(),
        api.getSystemConfig()
      ]);

      setProjects(projsData);
      if (projsData.length > 0) {
        setSelectedProjectId(prev => prev || projsData[0].id);
      }
      setTasks(tasksData);
      setWeeklyReports(reportsData);
      setMetrics(metricsData);
      setNotifications(notifsData);
      setLeaderboard(lbData);
      setBadges(badgesData);
      setUsers(allUsersData);
      setSystemConfig(cfgData);

      const inbox = await api.getReviewInbox().catch(() => null);
      if (inbox) setReviewInboxData(inbox);

      const audits = await api.getAuditEvents().catch(() => []);
      setAuditEvents(audits);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleRefreshAll = async () => {
    if (!currentUser) return;
    setRefreshing(true);
    try {
      await loadAllData(currentUser);
      toast.success('System data synchronized successfully.', 'Refreshed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to refresh data', 'Refresh Error');
    } finally {
      setRefreshing(false);
    }
  };


  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Milestone actions
  const handleMilestoneSubmitReview = async () => {
    if (!milestoneToSubmit || !evidenceNotes) {
      toast.warning('Acceptance evidence notes are required for review verification!', 'Evidence Required');
      return;
    }
    await api.submitMilestoneForReview(milestoneToSubmit.id, evidenceNotes, evidenceUrl);
    setMilestoneToSubmit(null);
    setEvidenceNotes('');
    setEvidenceUrl('');
    triggerCelebration();
    toast.success(`Milestone stage ${milestoneToSubmit.sequence} submitted for verification gate!`, 'Submitted For Review');
    if (currentUser) loadAllData(currentUser);
  };

  const handleMilestoneReviewDecision = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!milestoneToReview || !reviewComments) {
      toast.warning('Reviewer decision comments are mandatory!', 'Audit Notes Required');
      return;
    }
    await api.reviewMilestone(milestoneToReview.id, decision, reviewComments);
    setMilestoneToReview(null);
    setReviewComments('');
    if (decision === 'APPROVED') {
      triggerCelebration();
      toast.success('Milestone deliverable approved & acceptance completed!', 'Gate Approved');
    } else {
      toast.warning('Requested revision notes returned to project owner.', 'Changes Requested');
    }
    if (currentUser) loadAllData(currentUser);
  };

  // Task actions
  const handleTaskSubmitReview = async (taskId: number) => {
    await api.submitTaskForReview(taskId, 'Deliverable completed and ready for acceptance review.');
    triggerCelebration();
    toast.success('Task submitted for review (+40 XP)!', 'Task Verification');
    if (currentUser) loadAllData(currentUser);
  };

  const handleScheduleChangeSubmit = async () => {
    if (!taskForScheduleChange || !newDueDateInput || !scheduleReasonInput) {
      toast.warning('New due date and justification are required!', 'Incomplete Request');
      return;
    }
    await api.requestScheduleChange(taskForScheduleChange.id, newDueDateInput, scheduleReasonInput);
    setTaskForScheduleChange(null);
    setNewDueDateInput('');
    setScheduleReasonInput('');
    toast.success('Schedule extension request recorded! Original due date preserved in audit history.', 'Schedule Request Logged');
    if (currentUser) loadAllData(currentUser);
  };

  // Weekly report save
  const handleSaveWeeklyReport = async (data: any) => {
    await api.saveWeeklyReport(data);
    triggerCelebration();
    if (currentUser) loadAllData(currentUser);
  };

  // Review inbox actions
  const handleInboxReviewMilestone = async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string) => {
    await api.reviewMilestone(id, decision, comments);
    if (decision === 'APPROVED') triggerCelebration();
    if (currentUser) loadAllData(currentUser);
  };

  const handleInboxReviewTask = async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string) => {
    await api.reviewTask(id, decision, comments);
    if (decision === 'APPROVED') triggerCelebration();
    if (currentUser) loadAllData(currentUser);
  };

  const handleInboxReviewReport = async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string) => {
    await api.reviewWeeklyReport(id, decision, comments);
    if (decision === 'APPROVED') triggerCelebration();
    if (currentUser) loadAllData(currentUser);
  };

  const handleInboxReviewSchedule = async (id: number, status: 'APPROVED' | 'REJECTED', notes: string) => {
    await api.reviewScheduleRequest(id, status, notes);
    if (currentUser) loadAllData(currentUser);
  };

  // Admin actions
  const handleAdminCreateUser = async (data: any) => {
    await api.createUser(data);
    if (currentUser) loadAllData(currentUser);
  };

  const handleAdminUpdateUser = async (id: number, data: any) => {
    await api.updateUser(id, data);
    if (currentUser) loadAllData(currentUser);
  };

  const handleAdminArchive = async (id: number) => {
    await api.archiveProject(id);
    if (currentUser) loadAllData(currentUser);
  };

  const handleAdminRestore = async (id: number) => {
    await api.restoreProject(id);
    if (currentUser) loadAllData(currentUser);
  };

  const handleAdminDelete = async (id: number, reason: string) => {
    await api.deleteProject(id, reason);
    if (currentUser) loadAllData(currentUser);
  };

  const handleSaveProject = async (id: number | string, data: any) => {
    await api.updateProject(id, data);
    setProjectToEdit(null);
    toast.success('Project plan updated successfully!', 'Project Updated');
    if (currentUser) loadAllData(currentUser);
  };

  const handleDeleteProject = async (id: number | string, reason: string) => {
    await api.deleteProject(id, reason);
    setProjectToDelete(null);
    toast.success('Project and associated milestones/tasks deleted.', 'Project Removed');
    if (currentUser) loadAllData(currentUser);
  };

  const handleAdminUpdateConfig = async (data: any) => {
    await api.updateSystemConfig(data);
    if (currentUser) loadAllData(currentUser);
  };

  const currentProject = projects.find(p => String(p.id) === String(selectedProjectId)) || projects[0] || null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Connecting to JG Innovative Hub Platform...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Top Navbar HUD */}
      <Navbar
        currentUser={currentUser}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={async (id) => {
          const now = new Date().toISOString();
          setNotifications(prev => prev.map(n => (String(n.id) === String(id) || (n._id && String(n._id) === String(id))) ? { ...n, readAt: n.readAt || now } : n));
          await api.markNotificationRead(id);
        }}
        onMarkAllNotificationsRead={async () => {
          const now = new Date().toISOString();
          setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || now })));
          await api.markAllNotificationsRead();
        }}
        onLogout={() => setIsLogoutModalOpen(true)}
        onRefreshAll={handleRefreshAll}
        refreshing={refreshing}
        onOpenPersonalTracker={() => {
          setIsPersonalTrackerOpen(!isPersonalTrackerOpen);
          setIsAttendanceOpen(false);
        }}
        isPersonalTrackerActive={isPersonalTrackerOpen}
        onOpenAttendance={() => {
          setIsAttendanceOpen(!isAttendanceOpen);
          setIsPersonalTrackerOpen(false);
        }}
        isAttendanceActive={isAttendanceOpen}
      />

      {/* Main Workspace Render - Strictly Gated by currentUser.role */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Toggleable Full-Screen Attendance System */}
        {isAttendanceOpen ? (
          <AttendanceView
            currentUser={currentUser}
            onBackToDashboard={() => setIsAttendanceOpen(false)}
            allUsers={users}
          />
        ) : isPersonalTrackerOpen ? (
          <PersonalProjectTracker
            currentUser={currentUser}
            onBackToDashboard={() => setIsPersonalTrackerOpen(false)}
          />
        ) : (
          <>
            {/* 1. CEO STRATEGIC PORTFOLIO - Visible ONLY to CEO */}
            {currentUser.role === 'CEO' && metrics && (
              <CeoDashboard
                currentUser={currentUser}
                projects={projects}
                metrics={metrics}
                weeklyReports={weeklyReports}
                tasks={tasks}
                onOpenProjectWizard={() => setIsProjectWizardOpen(true)}
                onOpenWeeklyReportModal={(rep) => {
                  setSelectedReportForEdit(rep);
                  setIsWeeklyReportModalOpen(true);
                }}
                onSelectMilestoneForReview={(m) => setMilestoneToReview(m)}
                onCreateUser={handleAdminCreateUser}
                onEditProject={(p) => setProjectToEdit(p)}
                onDeleteProject={(p) => setProjectToDelete(p)}
              />
            )}

            {/* 2. COO OPERATIONS COCKPIT - Visible ONLY to COO */}
            {currentUser.role === 'COO' && metrics && (
              <CooDashboard
                currentUser={currentUser}
                projects={projects}
                metrics={metrics}
                tasks={tasks}
                weeklyReports={weeklyReports}
                users={users}
                reviewInboxData={reviewInboxData || { pendingMilestones: [], pendingTasks: [], pendingReports: [], pendingSchedules: [], totalBacklog: 0 }}
                onOpenProjectWizard={() => setIsProjectWizardOpen(true)}
                onOpenReviewInbox={() => setIsReviewInboxOpen(true)}
                onOpenWeeklyReportModal={(rep) => {
                  setSelectedReportForEdit(rep);
                  setIsWeeklyReportModalOpen(true);
                }}
                onReviewWeeklyReport={handleInboxReviewReport}
                onReviewSchedule={handleInboxReviewSchedule}
                onCreateUser={handleAdminCreateUser}
                onEditProject={(p) => setProjectToEdit(p)}
                onDeleteProject={(p) => setProjectToDelete(p)}
              />
            )}

            {/* 3. CONTRIBUTOR (USER) DASHBOARD - Visible to EMPLOYEE / Contributor */}
            {currentUser.role !== 'CEO' && currentUser.role !== 'COO' && (
              <EmployeeDashboard
                currentUser={currentUser}
                projects={projects}
                selectedProject={currentProject}
                tasks={tasks}
                weeklyReports={weeklyReports}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onOpenBlockerModal={(t) => {
                  setSelectedTaskForBlocker(t);
                  setIsBlockerModalOpen(true);
                }}
                onOpenScheduleModal={(t) => {
                  setTaskForScheduleChange(t);
                  setNewDueDateInput(t.dueDate);
                }}
                onSubmitTaskForReview={handleTaskSubmitReview}
                onSubmitMilestoneForReview={(m) => setMilestoneToSubmit(m)}
                onReviewMilestone={(m) => setMilestoneToReview(m)}
                onOpenWeeklyReportModal={(rep) => {
                  setSelectedReportForEdit(rep);
                  setIsWeeklyReportModalOpen(true);
                }}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                onOpenAttendance={() => setIsAttendanceOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* MODAL: SUBMIT MILESTONE FOR REVIEW */}
      {milestoneToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-gray-900">Submit Milestone for Verification Gate</h3>
            <p className="text-xs text-gray-700">
              Submitting Stage {milestoneToSubmit.sequence}: <strong className="text-gray-900">{milestoneToSubmit.title}</strong>
            </p>
            <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs">
              <span className="text-indigo-700 font-bold block mb-0.5">Required Acceptance Criteria:</span>
              <p className="text-gray-700 font-mono">{milestoneToSubmit.acceptanceCriteria}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Evidence Notes & Verification Test Results *
              </label>
              <textarea
                rows={3}
                required
                value={evidenceNotes}
                onChange={e => setEvidenceNotes(e.target.value)}
                placeholder="Detail verification numbers, test logs, simulation results..."
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Deliverable Document / Repository URL
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={e => setEvidenceUrl(e.target.value)}
                placeholder="https://docs.jginnovative.internal/..."
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setMilestoneToSubmit(null)} className="px-3 py-1.5 text-xs text-gray-900">Cancel</button>
              <button
                onClick={handleMilestoneSubmitReview}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
              >
                Submit for Verification Gate (+60 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONDUCT MILESTONE REVIEW */}
      {milestoneToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-amber-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-gray-900">Milestone Verification Gate Decision</h3>
            <p className="text-xs text-gray-700">
              Stage {milestoneToReview.sequence}: <strong className="text-gray-900">{milestoneToReview.title}</strong>
            </p>
            {milestoneToReview.evidenceNotes && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs">
                <span className="text-emerald-700 font-bold block mb-0.5">Submitted Evidence:</span>
                <p className="text-emerald-900">{milestoneToReview.evidenceNotes}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Review Decision Comments (Mandatory for audit):
              </label>
              <textarea
                rows={3}
                required
                value={reviewComments}
                onChange={e => setReviewComments(e.target.value)}
                placeholder="Enter audit evaluation feedback..."
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setMilestoneToReview(null)} className="px-3 py-1.5 text-xs text-gray-900">Cancel</button>
              <button
                onClick={() => handleMilestoneReviewDecision('CHANGES_REQUESTED')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-50 text-rose-700 border border-rose-200"
              >
                Request Changes
              </button>
              <button
                onClick={() => handleMilestoneReviewDecision('APPROVED')}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
              >
                Approve & Complete (+{milestoneToReview.xpReward} XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST SCHEDULE CHANGE */}
      {taskForScheduleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-gray-900">Request Schedule Change</h3>
            <p className="text-xs text-gray-700">
              Task: <strong className="text-gray-900">{taskForScheduleChange.title}</strong>
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs text-gray-600">
              Original Due Date: <strong className="text-gray-800">{taskForScheduleChange.originalDueDate}</strong> (Retained in History)
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Proposed New Due Date *</label>
              <input
                type="date"
                value={newDueDateInput}
                onChange={e => setNewDueDateInput(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Schedule Adjustment Rationale *</label>
              <textarea
                rows={3}
                value={scheduleReasonInput}
                onChange={e => setScheduleReasonInput(e.target.value)}
                placeholder="Explain justification for deadline change..."
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setTaskForScheduleChange(null)} className="px-3 py-1.5 text-xs text-gray-900">Cancel</button>
              <button
                onClick={handleScheduleChangeSubmit}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Submit Schedule Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        leaderboard={leaderboard}
        badges={badges}
        currentUser={currentUser}
      />

      <ReviewInboxModal
        isOpen={isReviewInboxOpen}
        onClose={() => setIsReviewInboxOpen(false)}
        inboxData={reviewInboxData || { pendingMilestones: [], pendingTasks: [], pendingReports: [], pendingSchedules: [], totalBacklog: 0 }}
        onReviewMilestone={handleInboxReviewMilestone}
        onReviewTask={handleInboxReviewTask}
        onReviewWeeklyReport={handleInboxReviewReport}
        onReviewSchedule={handleInboxReviewSchedule}
      />

      <ProjectWizardModal
        isOpen={isProjectWizardOpen}
        onClose={() => setIsProjectWizardOpen(false)}
        users={users}
        onCreateProject={async (data) => {
          await api.createProject(data);
          triggerCelebration();
          if (currentUser) loadAllData(currentUser);
        }}
      />

      <BlockerModal
        isOpen={isBlockerModalOpen}
        onClose={() => setIsBlockerModalOpen(false)}
        task={selectedTaskForBlocker}
        onSubmitBlocker={async (taskId, data) => {
          await api.reportBlocker(taskId, data);
          if (currentUser) loadAllData(currentUser);
        }}
      />

      <WeeklyReportModal
        isOpen={isWeeklyReportModalOpen}
        onClose={() => setIsWeeklyReportModalOpen(false)}
        report={selectedReportForEdit}
        currentUser={currentUser}
        onSaveReport={handleSaveWeeklyReport}
      />

      <EditProjectModal
        isOpen={!!projectToEdit}
        project={projectToEdit}
        users={users}
        onClose={() => setProjectToEdit(null)}
        onSaveProject={handleSaveProject}
      />

      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirmDelete={handleDeleteProject}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={() => {
          setIsLogoutModalOpen(false);
          handleLogout();
        }}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;

