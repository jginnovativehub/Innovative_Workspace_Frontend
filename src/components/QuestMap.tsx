import React, { useState } from 'react';
import { Milestone, Task, User } from '../types';
import { 
  CheckCircle2, Clock, AlertTriangle, ShieldAlert, Sparkles, 
  ExternalLink, ChevronRight, User as UserIcon, Calendar, ArrowRight,
  Send, Check, X, ShieldCheck
} from 'lucide-react';

interface QuestMapProps {
  milestones: Milestone[];
  currentUser: User;
  onSelectMilestone: (m: Milestone) => void;
  onSubmitForReview: (m: Milestone) => void;
  onReviewMilestone: (m: Milestone) => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({
  milestones,
  currentUser,
  onSelectMilestone,
  onSubmitForReview,
  onReviewMilestone
}) => {
  const [activeNode, setActiveNode] = useState<Milestone | null>(milestones[0] || null);

  const getStatusVisuals = (status: Milestone['status']) => {
    switch (status) {
      case 'APPROVED_COMPLETED':
        return {
          bg: 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-4 ring-emerald-500/20 shadow-emerald-500/20 shadow-lg',
          line: 'bg-emerald-500',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          label: 'Conquered & Verified'
        };
      case 'SUBMITTED_FOR_REVIEW':
        return {
          bg: 'bg-amber-500/20 border-amber-500 text-amber-300 ring-4 ring-amber-500/20 shadow-amber-500/20 shadow-lg animate-pulse',
          line: 'bg-amber-500/60',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
          label: 'Awaiting Sign-off'
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-4 ring-cyan-500/20 shadow-cyan-500/20 shadow-lg quest-node-active',
          line: 'bg-slate-700',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
          label: 'Active Quest'
        };
      case 'BLOCKED':
        return {
          bg: 'bg-rose-500/20 border-rose-500 text-rose-300 ring-4 ring-rose-500/20 shadow-rose-500/20 shadow-lg',
          line: 'bg-slate-700',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          label: 'Path Blocked'
        };
      case 'CHANGES_REQUESTED':
        return {
          bg: 'bg-orange-500/20 border-orange-500 text-orange-300 ring-4 ring-orange-500/20 shadow-orange-500/20 shadow-lg',
          line: 'bg-slate-700',
          badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          label: 'Revisions Required'
        };
      default:
        return {
          bg: 'bg-slate-800/80 border-slate-700 text-slate-400',
          line: 'bg-slate-800',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: <Clock className="w-5 h-5 text-slate-500" />,
          label: 'Locked / Not Started'
        };
    }
  };

  const selectedNode = activeNode || milestones[0];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>🗺️ Milestone Quest Expedition Map</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              {milestones.length} Expedition Stages
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive journey tree connecting milestones, dependencies, and acceptance checkpoints.
          </p>
        </div>
      </div>

      {/* Horizontal Quest Trail Visualization */}
      <div className="py-8 overflow-x-auto">
        <div className="flex items-center min-w-max px-4">
          {milestones.map((ms, idx) => {
            const visual = getStatusVisuals(ms.status);
            const isSelected = selectedNode?.id === ms.id;
            const isLast = idx === milestones.length - 1;

            return (
              <React.Fragment key={ms.id}>
                <div 
                  onClick={() => {
                    setActiveNode(ms);
                    onSelectMilestone(ms);
                  }}
                  className={`cursor-pointer flex flex-col items-center group transition-all duration-300 ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  {/* Stage Node Sphere */}
                  <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${visual.bg} ${
                    isSelected ? 'ring-2 ring-indigo-400 shadow-indigo-500/30' : ''
                  }`}>
                    {visual.icon}
                  </div>

                  {/* Stage Details Label */}
                  <div className="text-center mt-3 max-w-[130px]">
                    <span className="text-[10px] font-bold text-indigo-400 block tracking-wider uppercase">
                      Stage {ms.sequence}
                    </span>
                    <span className={`text-xs font-semibold line-clamp-2 mt-0.5 ${
                      isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {ms.title}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold block mt-1">
                      +{ms.xpReward} XP Bounty
                    </span>
                  </div>
                </div>

                {/* Connecting Neon Linkage Line */}
                {!isLast && (
                  <div className="flex items-center mx-3 mb-10">
                    <div className={`h-1 w-12 rounded-full transition-all duration-500 ${
                      ms.status === 'APPROVED_COMPLETED' ? 'bg-gradient-to-r from-emerald-500 to-indigo-500' : 'bg-slate-800'
                    }`} />
                    <ArrowRight className={`w-3.5 h-3.5 -ml-1 ${
                      ms.status === 'APPROVED_COMPLETED' ? 'text-emerald-400' : 'text-slate-700'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Milestone Inspection Cockpit */}
      {selectedNode && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/50 rounded-xl p-5 border border-slate-800/60">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Stage {selectedNode.sequence}
                </span>
                <h4 className="text-base font-bold text-white">{selectedNode.title}</h4>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusVisuals(selectedNode.status).badge}`}>
                  {getStatusVisuals(selectedNode.status).label}
                </span>
              </div>

              {selectedNode.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
              )}

              {/* Acceptance Criteria Box */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                  🎯 Formal Acceptance Criteria (Verification Gate):
                </span>
                <p className="text-xs text-slate-300 font-mono">{selectedNode.acceptanceCriteria}</p>
              </div>

              {/* Evidence if submitted/approved */}
              {selectedNode.evidenceNotes && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg text-xs">
                  <span className="font-bold text-emerald-400 block mb-0.5">Submitted Test Evidence:</span>
                  <p className="text-emerald-200">{selectedNode.evidenceNotes}</p>
                  {selectedNode.evidenceUrl && (
                    <a 
                      href={selectedNode.evidenceUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-medium mt-1 text-[11px]"
                    >
                      <span>Inspect Deliverable Package</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Personnel & Dates */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                <div className="flex items-center space-x-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Owner: <strong className="text-slate-200">{selectedNode.ownerName || 'Unassigned'}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reviewer: <strong className="text-slate-200">{selectedNode.reviewerName || 'Unassigned'}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Due: <strong className="text-slate-200">{selectedNode.dueDate}</strong></span>
                </div>
              </div>
            </div>

            {/* Stage Action Controls */}
            <div className="flex flex-col gap-2 min-w-[180px]">
              {/* Submit for Review (if In Progress or Changes Requested) */}
              {(selectedNode.status === 'IN_PROGRESS' || selectedNode.status === 'CHANGES_REQUESTED' || selectedNode.status === 'NOT_STARTED') && (
                <button
                  onClick={() => onSubmitForReview(selectedNode)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-500/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              )}

              {/* Review Milestone (if Submitted & authorized reviewer or management) */}
              {selectedNode.status === 'SUBMITTED_FOR_REVIEW' && (
                <button
                  onClick={() => onReviewMilestone(selectedNode)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Conduct Review Gate</span>
                </button>
              )}

              {selectedNode.status === 'APPROVED_COMPLETED' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <span className="text-xs font-bold text-emerald-400 block">Milestone Conquered!</span>
                  <span className="text-[10px] text-emerald-300/80">Accepted {selectedNode.acceptedAt ? new Date(selectedNode.acceptedAt).toLocaleDateString() : 'Yes'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

