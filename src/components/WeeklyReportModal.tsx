import React, { useState, useEffect } from 'react';
import { WeeklyReport, User } from '../types';
import { FileText, History, Save, Send, X, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WeeklyReport | null;
  currentUser: User;
  onSaveReport: (data: any) => Promise<void>;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  isOpen,
  onClose,
  report,
  currentUser,
  onSaveReport
}) => {
  const [activeTab, setActiveTab] = useState<'EDITOR' | 'VERSIONS'>('EDITOR');

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const friday = new Date(today);
  friday.setDate(today.getDate() - today.getDay() + 5);

  const [periodStart, setPeriodStart] = useState(monday.toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState(friday.toISOString().split('T')[0]);
  const [completedThisWeek, setCompletedThisWeek] = useState('');
  const [inProgress, setInProgress] = useState('');
  const [blockersRisks, setBlockersRisks] = useState('');
  const [reasonForDelay, setReasonForDelay] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [nextWeekPlan, setNextWeekPlan] = useState('');
  const [supportDecisionsRequired, setSupportDecisionsRequired] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (report) {
      setPeriodStart(report.periodStart);
      setPeriodEnd(report.periodEnd);
      const latestVer = report.versions?.[0];
      if (latestVer) {
        setCompletedThisWeek(latestVer.completedThisWeek || '');
        setInProgress(latestVer.inProgress || '');
        setBlockersRisks(latestVer.blockersRisks || '');
        setReasonForDelay(latestVer.reasonForDelay || '');
        setProposedSolution(latestVer.proposedSolution || '');
        setNextWeekPlan(latestVer.nextWeekPlan || '');
        setSupportDecisionsRequired(latestVer.supportDecisionsRequired || '');
      }
    }
  }, [report]);

  if (!isOpen) return null;

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && (!completedThisWeek || !inProgress || !nextWeekPlan)) {
      toast.warning('Completed deliverables, in-progress items, and next week plan are required to submit!', 'Mandatory Weekly Sections Missing');
      return;
    }

    setSubmitting(true);
    try {
      await onSaveReport({
        periodStart,
        periodEnd,
        completedThisWeek,
        inProgress,
        blockersRisks,
        reasonForDelay,
        proposedSolution,
        nextWeekPlan,
        supportDecisionsRequired,
        isDraft
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900">Weekly Progress Report</h3>
                {report && (
                  <span className={`text-xs px-2 py-0.5 rounded font-bold border ${
                    report.status === 'REVIEWED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    report.status === 'CHANGES_REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    report.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-indigo-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {report.status} • Version {report.currentVersion}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">Structured deliverables, blocker triage, and versioned progress logs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 px-4 sm:px-6 pt-2 bg-white/40 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('EDITOR')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'EDITOR'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Report Fields</span>
          </button>
          {report && (
            <button
              onClick={() => setActiveTab('VERSIONS')}
              className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
                activeTab === 'VERSIONS'
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-gray-600 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Revision History ({report.versions?.length || 0} Versions)</span>
            </button>
          )}
        </div>

        {/* Reviewer Feedback Banner if Changes Requested */}
        {report?.status === 'CHANGES_REQUESTED' && report.reviewerFeedback && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-800 block mb-0.5">
                Reviewer Changes Requested by {report.reviewerName || 'Management'}:
              </span>
              <p className="text-amber-900 leading-relaxed font-mono">{report.reviewerFeedback}</p>
              <span className="text-[10px] text-amber-800 block mt-1">Please address requested points and resubmit. Previous versions remain preserved.</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'EDITOR' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Period Start</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={e => setPeriodStart(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Period End</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={e => setPeriodEnd(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-700 block mb-1">
                  Completed This Week (Outcomes & Deliverables, not just activity) *
                </label>
                <textarea
                  rows={3}
                  value={completedThisWeek}
                  onChange={e => setCompletedThisWeek(e.target.value)}
                  placeholder="Specific deliverables completed, tests run, pull requests merged..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-blue-700 block mb-1">
                  In Progress (Current status, progress summary, next action) *
                </label>
                <textarea
                  rows={2}
                  value={inProgress}
                  onChange={e => setInProgress(e.target.value)}
                  placeholder="Active tasks being executed..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-rose-700 block mb-1">
                    Blockers & Risks (Issue, impact, owner needed to resolve)
                  </label>
                  <textarea
                    rows={2}
                    value={blockersRisks}
                    onChange={e => setBlockersRisks(e.target.value)}
                    placeholder="Any impediment or schedule bottleneck..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-amber-700 block mb-1">
                    Proposed Solution / Recovery Plan
                  </label>
                  <textarea
                    rows={2}
                    value={proposedSolution}
                    onChange={e => setProposedSolution(e.target.value)}
                    placeholder="Mitigation steps to overcome risks..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-indigo-700 block mb-1">
                    Next Week Plan (Specific deliverables and intended completion dates) *
                  </label>
                  <textarea
                    rows={2}
                    value={nextWeekPlan}
                    onChange={e => setNextWeekPlan(e.target.value)}
                    placeholder="Committed milestones and tasks for upcoming cycle..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Support / Decisions Required (Approvals, budgets, equipment)
                  </label>
                  <textarea
                    rows={2}
                    value={supportDecisionsRequired}
                    onChange={e => setSupportDecisionsRequired(e.target.value)}
                    placeholder="Management input or purchase authorizations..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs text-gray-900 block">
                Preserved audit of submitted revisions for period {report?.periodStart} to {report?.periodEnd}:
              </span>
              {(report?.versions || []).map(v => (
                <div key={v.id} className="bg-white/70 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-indigo-200">
                      Revision Version {v.versionNumber}
                    </span>
                    <span className="text-[11px] text-gray-600">
                      Submitted: {new Date(v.submittedAt).toLocaleString()} by {v.submitterName}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-emerald-700 block">Completed:</strong>
                      <p className="text-gray-700">{v.completedThisWeek}</p>
                    </div>
                    <div>
                      <strong className="text-blue-700 block">In Progress:</strong>
                      <p className="text-gray-700">{v.inProgress}</p>
                    </div>
                    {v.blockersRisks && (
                      <div>
                        <strong className="text-rose-700 block">Blockers:</strong>
                        <p className="text-gray-700">{v.blockersRisks}</p>
                      </div>
                    )}
                    <div>
                      <strong className="text-indigo-700 block">Next Week Plan:</strong>
                      <p className="text-gray-700">{v.nextWeekPlan}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between bg-white/80">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900">
            Close
          </button>
          <div className="flex space-x-3">
            <button
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 transition-all flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Draft</span>
            </button>
            <button
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Verification (+50 XP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


