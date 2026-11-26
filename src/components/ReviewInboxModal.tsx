import React, { useState } from 'react';
import { Milestone, Task, WeeklyReport, ScheduleChangeRequest, User } from '../types';
import { 
  Inbox, CheckCircle2, AlertTriangle, FileText, Calendar, 
  Send, ExternalLink, X, MessageSquare, Check, Clock, User as UserIcon
} from 'lucide-react';
import { toast } from '../context/ToastContext';

interface ReviewInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  inboxData: {
    pendingMilestones: Milestone[];
    pendingTasks: Task[];
    pendingReports: WeeklyReport[];
    pendingSchedules: ScheduleChangeRequest[];
    totalBacklog: number;
  };
  onReviewMilestone: (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string) => Promise<void>;
  onReviewTask: (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string) => Promise<void>;
  onReviewWeeklyReport: (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED', comments: string) => Promise<void>;
  onReviewSchedule: (id: number, status: 'APPROVED' | 'REJECTED', notes: string) => Promise<void>;
}

export const ReviewInboxModal: React.FC<ReviewInboxModalProps> = ({
  isOpen,
  onClose,
  inboxData,
  onReviewMilestone,
  onReviewTask,
  onReviewWeeklyReport,
  onReviewSchedule
}) => {
  const [activeTab, setActiveTab] = useState<'MILESTONES' | 'TASKS' | 'REPORTS' | 'SCHEDULES'>('MILESTONES');
  const [commentText, setCommentText] = useState('');
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleMilestoneAction = async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!commentText.trim()) {
      toast.warning('Reviewer comments / evaluation notes are mandatory for auditing!', 'Audit Evaluation Required');
      return;
    }
    setSubmittingId(id);
    try {
      await onReviewMilestone(id, decision, commentText);
      setCommentText('');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleTaskAction = async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!commentText.trim()) {
      toast.warning('Reviewer feedback comments are mandatory!', 'Review Feedback Required');
      return;
    }
    setSubmittingId(id);
    try {
      await onReviewTask(id, decision, commentText);
      setCommentText('');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReportAction = async (id: number, decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!commentText.trim()) {
      toast.warning('Reviewer notes are mandatory!', 'Report Review Notes Required');
      return;
    }
    setSubmittingId(id);
    try {
      await onReviewWeeklyReport(id, decision, commentText);
      setCommentText('');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleScheduleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setSubmittingId(id);
    try {
      await onReviewSchedule(id, status, commentText || 'Schedule review decided.');
      setCommentText('');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900">Management Review Inbox</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  {inboxData.totalBacklog} Actions Pending
                </span>
              </div>
              <p className="text-xs text-gray-600">Assess milestone deliverables, evaluate reports, and audit schedule modifications.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-gray-200 px-4 sm:px-6 pt-2 bg-white/40 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('MILESTONES')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'MILESTONES'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-700'
            }`}
          >
            <span>Milestones ({inboxData.pendingMilestones.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'TASKS'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-700'
            }`}
          >
            <span>Tasks ({inboxData.pendingTasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'REPORTS'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-700'
            }`}
          >
            <span>Weekly Reports ({inboxData.pendingReports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULES')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'SCHEDULES'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-700'
            }`}
          >
            <span>Schedule Changes ({inboxData.pendingSchedules.length})</span>
          </button>
        </div>

        {/* Feedback Input Sticky Bar */}
        <div className="p-4 bg-white/60 border-b border-gray-200">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
            Reviewer Decision Notes / Required Feedback:
          </label>
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Type feedback comment before clicking Approve or Request Changes..."
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'MILESTONES' && (
            inboxData.pendingMilestones.length === 0 ? (
              <div className="p-10 text-center text-gray-900 text-xs">Zero milestones awaiting review. All caught up!</div>
            ) : (
              inboxData.pendingMilestones.map(m => (
                <div key={m.id} className="bg-white/50 border border-gray-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-indigo-200">
                          Stage {m.sequence}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900">{m.title}</h4>
                      </div>
                      <span className="text-xs text-gray-600 mt-0.5 block">Project: {m.projectName} • Owner: {m.ownerName}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-200">
                      SUBMITTED FOR REVIEW
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs">
                    <span className="text-gray-600 font-semibold block mb-0.5">Verification Criteria:</span>
                    <p className="text-gray-700 font-mono">{m.acceptanceCriteria}</p>
                  </div>

                  {m.evidenceNotes && (
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs">
                      <span className="text-emerald-700 font-bold block mb-0.5">Submitted Evidence & Notes:</span>
                      <p className="text-emerald-900">{m.evidenceNotes}</p>
                      {m.evidenceUrl && (
                        <a href={m.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-blue-700 font-medium mt-1">
                          <span>Open Evidence Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-2 sm:gap-3 pt-2">
                    <button
                      disabled={submittingId === m.id}
                      onClick={() => handleMilestoneAction(m.id, 'CHANGES_REQUESTED')}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-500/10 hover:bg-rose-50 text-rose-700 border border-rose-200 transition-all flex items-center space-x-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Request Changes</span>
                    </button>
                    <button
                      disabled={submittingId === m.id}
                      onClick={() => handleMilestoneAction(m.id, 'APPROVED')}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Accept (+{m.xpReward} XP)</span>
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'TASKS' && (
            inboxData.pendingTasks.length === 0 ? (
              <div className="p-10 text-center text-gray-600 text-xs">Zero tasks awaiting review.</div>
            ) : (
              inboxData.pendingTasks.map(t => (
                <div key={t.id} className="bg-white/50 border border-gray-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{t.title}</h4>
                      <span className="text-xs text-gray-600 mt-0.5 block">
                        Milestone: {t.milestoneTitle} • Assignee: {t.ownerName}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
                      SUBMITTED
                    </span>
                  </div>

                  {t.acceptanceCriteria && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs">
                      <span className="text-gray-600 font-semibold block mb-0.5">Acceptance Criteria:</span>
                      <p className="text-gray-700">{t.acceptanceCriteria}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-2 sm:gap-3 pt-2">
                    <button
                      disabled={submittingId === t.id}
                      onClick={() => handleTaskAction(t.id, 'CHANGES_REQUESTED')}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-500/20 transition-all"
                    >
                      Request Changes
                    </button>
                    <button
                      disabled={submittingId === t.id}
                      onClick={() => handleTaskAction(t.id, 'APPROVED')}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                    >
                      Approve Deliverable (+{t.xpReward} XP)
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'REPORTS' && (
            inboxData.pendingReports.length === 0 ? (
              <div className="p-10 text-center text-gray-600 text-xs">Zero weekly reports awaiting review.</div>
            ) : (
              inboxData.pendingReports.map(r => {
                const latestVer = r.versions?.[0];
                return (
                  <div key={r.id} className="bg-white/50 border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-gray-900">{r.userName}'s Weekly Report</h4>
                          <span className="text-xs px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-800 border border-purple-200">
                            Version {r.currentVersion}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 block mt-0.5">
                          Period: {r.periodStart} to {r.periodEnd} • Submitted: {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-500/10 px-2 py-1 rounded border border-amber-200">
                        PENDING AUDIT
                      </span>
                    </div>

                    {latestVer && (
                      <div className="space-y-2 text-xs bg-white p-4 rounded-xl border border-gray-200">
                        <div>
                          <strong className="text-emerald-700 block mb-0.5">Completed This Week:</strong>
                          <p className="text-gray-700">{latestVer.completedThisWeek}</p>
                        </div>
                        <div>
                          <strong className="text-blue-700 block mb-0.5">In Progress:</strong>
                          <p className="text-gray-700">{latestVer.inProgress}</p>
                        </div>
                        {latestVer.blockersRisks && (
                          <div>
                            <strong className="text-rose-700 block mb-0.5">Blockers & Mitigations:</strong>
                            <p className="text-gray-700">{latestVer.blockersRisks}</p>
                          </div>
                        )}
                        <div>
                          <strong className="text-indigo-700 block mb-0.5">Next Week Plan:</strong>
                          <p className="text-gray-700">{latestVer.nextWeekPlan}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-end gap-2 sm:gap-3 pt-2">
                      <button
                        disabled={submittingId === r.id}
                        onClick={() => handleReportAction(r.id, 'CHANGES_REQUESTED')}
                        className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-500/20 transition-all"
                      >
                        Request Additions (REP-02)
                      </button>
                      <button
                        disabled={submittingId === r.id}
                        onClick={() => handleReportAction(r.id, 'APPROVED')}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-500 transition-all"
                      >
                        Approve & Accept Report (+100 XP)
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}

          {activeTab === 'SCHEDULES' && (
            inboxData.pendingSchedules.length === 0 ? (
              <div className="p-10 text-center text-gray-600 text-xs">Zero schedule change requests pending.</div>
            ) : (
              inboxData.pendingSchedules.map(sq => (
                <div key={sq.id} className="bg-white/50 border border-gray-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Schedule Change Request</h4>
                      <span className="text-xs text-gray-600 block mt-0.5">
                        Task: {sq.taskTitle} • Requester: {sq.requesterName}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-500/10 px-2 py-1 rounded border border-amber-200">
                      PENDING APPROVAL
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 bg-white p-3 rounded-lg border border-gray-200 text-xs">
                    <div>
                      <span className="text-gray-600 block">Original Due Date</span>
                      <span className="font-mono font-bold text-gray-700 line-through">{sq.oldDueDate}</span>
                    </div>
                    <span className="text-gray-600 font-bold">➔</span>
                    <div>
                      <span className="text-blue-700 block font-semibold">Proposed Due Date</span>
                      <span className="font-mono font-bold text-blue-800">{sq.newDueDate}</span>
                    </div>
                  </div>

                  <div className="text-xs bg-white p-3 rounded-lg border border-gray-200 text-gray-700">
                    <strong className="text-gray-600 block mb-0.5">Requester Rationale:</strong>
                    <p>{sq.reason}</p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 sm:gap-3 pt-2">
                    <button
                      disabled={submittingId === sq.id}
                      onClick={() => handleScheduleAction(sq.id, 'REJECTED')}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-500/20 transition-all"
                    >
                      Reject Extension
                    </button>
                    <button
                      disabled={submittingId === sq.id}
                      onClick={() => handleScheduleAction(sq.id, 'APPROVED')}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
                    >
                      Approve Schedule Adjustment
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};


