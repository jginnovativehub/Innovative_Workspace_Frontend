import React, { useState } from 'react';
import { Task } from '../types';
import { ShieldAlert, X, AlertOctagon, Send } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface BlockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmitBlocker: (taskId: number, data: any) => Promise<void>;
}

export const BlockerModal: React.FC<BlockerModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmitBlocker
}) => {
  const [summary, setSummary] = useState('');
  const [impact, setImpact] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [expectedResolutionDate, setExpectedResolutionDate] = useState(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [supportNeeded, setSupportNeeded] = useState('');
  const [workLog, setWorkLog] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !impact || !proposedSolution || !supportNeeded) {
      toast.warning('All 5 blocker exception fields are mandatory by company policy!', 'Mandatory Fields Missing');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitBlocker(task.id, {
        summary,
        impact,
        proposedSolution,
        expectedResolutionDate,
        supportNeeded,
        workLog
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-rose-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-1.5">
                <span>Formal Blocker & Risk Exception Form</span>
              </h3>
              <p className="text-xs text-rose-300/80">Immediate escalation protocol for stalled or high-risk deliverables</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 block font-semibold">Target Task:</span>
            <span className="text-white font-bold">{task.title}</span>
            <span className="text-slate-400 block text-[11px] mt-0.5">Under Milestone: {task.milestoneTitle}</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              1. Blocker Summary / Inability Reason *
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="e.g. Critical MOSFET distributor out of stock"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              2. Impact on Project & Downstream Milestones *
            </label>
            <textarea
              rows={2}
              required
              value={impact}
              onChange={e => setImpact(e.target.value)}
              placeholder="e.g. Halts Rev B board routing; downstream prototype assembly delayed 4 days"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              3. Proposed Solution / Recovery Plan *
            </label>
            <textarea
              rows={2}
              required
              value={proposedSolution}
              onChange={e => setProposedSolution(e.target.value)}
              placeholder="e.g. Re-route pad layout for dual-compatible D2PAK footprint and order Vishay samples"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                4. Expected Resolution Date
              </label>
              <input
                type="date"
                value={expectedResolutionDate}
                onChange={e => setExpectedResolutionDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                5. Support / Decision Maker Needed *
              </label>
              <input
                type="text"
                required
                value={supportNeeded}
                onChange={e => setSupportNeeded(e.target.value)}
                placeholder="e.g. COO expedited sample PO approval"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">
              Current Work Log & Evidence of State (Optional)
            </label>
            <input
              type="text"
              value={workLog}
              onChange={e => setWorkLog(e.target.value)}
              placeholder="e.g. 80% routing completed, halted at output stage"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Blocker Escalation (+30 XP)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

