import React, { useState } from 'react';
import { User } from '../types';
import { FolderPlus, Plus, Trash2, X, Sparkles, Calendar, Layers } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface ProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onCreateProject: (data: any) => Promise<void>;
}

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({
  isOpen,
  onClose,
  users,
  onCreateProject
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [scope, setScope] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [ownerId, setOwnerId] = useState<number | ''>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  // Configurable Milestone Builder (Arbitrary count 3, 8, 12, etc.)
  const [milestones, setMilestones] = useState<Array<{
    title: string;
    description: string;
    sequence: number;
    startDate: string;
    dueDate: string;
    acceptanceCriteria: string;
    xpReward: number;
  }>>([
    {
      title: 'Phase 1: Specifications & Requirements',
      description: 'System specifications and architecture approval',
      sequence: 1,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      acceptanceCriteria: 'Formal design specification approved by Technical Lead.',
      xpReward: 300
    },
    {
      title: 'Phase 2: Core Engineering Build',
      description: 'Prototype implementation and engineering verification',
      sequence: 2,
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      acceptanceCriteria: 'Passes bench test suite with zero Sev-1 defects.',
      xpReward: 350
    },
    {
      title: 'Phase 3: Integration & Handover',
      description: 'Safety compliance, documentation, and delivery',
      sequence: 3,
      startDate: new Date(Date.now() + 51 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      acceptanceCriteria: 'Customer sign-off and regulatory safety checklist completed.',
      xpReward: 400
    }
  ]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    const nextSeq = milestones.length + 1;
    setMilestones([
      ...milestones,
      {
        title: `Stage ${nextSeq}: Milestone Deliverable`,
        description: 'Describe deliverable requirements...',
        sequence: nextSeq,
        startDate: startDate,
        dueDate: targetDate,
        acceptanceCriteria: 'Specific acceptance gate criteria...',
        xpReward: 300
      }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) {
      toast.warning('A project must have at least 1 milestone!', 'Milestone Requirement');
      return;
    }
    const updated = milestones.filter((_, i) => i !== index).map((m, i) => ({
      ...m,
      sequence: i + 1
    }));
    setMilestones(updated);
  };

  const handleMilestoneChange = (index: number, field: string, val: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: val };
    setMilestones(updated);
  };

  const handleSubmit = async () => {
    if (!code || !name || !objective) {
      toast.warning('Project Code, Name, and Objective are required!', 'Required Fields Missing');
      return;
    }

    await onCreateProject({
      code,
      name,
      objective,
      scope,
      deliverables,
      priority,
      startDate,
      targetDate,
      ownerId: ownerId !== '' ? Number(ownerId) : undefined,
      memberIds: selectedMemberIds,
      milestones
    });
    setCode('');
    setName('');
    setObjective('');
    setScope('');
    setDeliverables('');
    setOwnerId('');
    setSelectedMemberIds([]);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Planning Wizard</h2>
              <p className="text-xs text-gray-600">Step {step} of 2: {step === 1 ? 'Project Definition & Team' : 'Configurable Milestones Builder'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Project Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PRJ-SOLAR-04"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 uppercase font-mono focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. High-Density Solar Inverter Gen 3"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Strategic Objective *</label>
                <textarea
                  rows={2}
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="Primary business outcome, targets and technical purpose..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Scope</label>
                  <textarea
                    rows={2}
                    value={scope}
                    onChange={e => setScope(e.target.value)}
                    placeholder="Included subsystems, architecture boundaries..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Expected Deliverables</label>
                  <textarea
                    rows={2}
                    value={deliverables}
                    onChange={e => setDeliverables(e.target.value)}
                    placeholder="Prototypes, schematics, test certificates..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 font-mono"
                  />
                </div>
              </div>

              {/* Designated Initiative Lead / Owner */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Designated Initiative Lead / Owner
                </label>
                <select
                  value={ownerId}
                  onChange={e => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setOwnerId(val);
                    if (val && !selectedMemberIds.includes(val)) {
                      setSelectedMemberIds([...selectedMemberIds, val]);
                    }
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="">Executive Leadership (Self)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role} - {u.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Assign Contributor Team Members ({selectedMemberIds.length} Selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
                  {users.map(u => {
                    const isOwner = Number(ownerId) === u.id;
                    const isSelected = selectedMemberIds.includes(u.id) || isOwner;
                    return (
                      <label key={u.id} className="flex items-center space-x-2 text-xs text-gray-700 hover:text-gray-900 cursor-pointer p-1 rounded hover:bg-white select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isOwner}
                          onChange={e => {
                            if (e.target.checked) setSelectedMemberIds([...selectedMemberIds, u.id]);
                            else setSelectedMemberIds(selectedMemberIds.filter(id => id !== u.id));
                          }}
                          className="rounded border-gray-200 bg-white text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-medium truncate">{u.fullName}</span>
                        {isOwner && <span className="text-[10px] text-amber-700 font-bold ml-auto">(Lead)</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-700" />
                    <span>Configurable Milestone Schedule ({milestones.length} Milestones)</span>
                  </h4>
                  <p className="text-xs text-gray-900">
                    Add or remove any number of milestone gates (supports 3, 8, 12, or custom stages).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/40 hover:bg-indigo-600/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone Stage</span>
                </button>
              </div>

              <div className="space-y-3">
                {milestones.map((m, idx) => (
                  <div key={idx} className="bg-white/70 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-indigo-200 font-mono">
                        Stage {m.sequence}
                      </span>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="text-gray-600 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">Milestone Title *</label>
                        <input
                          type="text"
                          value={m.title}
                          onChange={e => handleMilestoneChange(idx, 'title', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-900 block mb-0.5">Start Date</label>
                          <input
                            type="date"
                            value={m.startDate}
                            onChange={e => handleMilestoneChange(idx, 'startDate', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-gray-900 block mb-0.5">Due Date</label>
                          <input
                            type="date"
                            value={m.dueDate}
                            onChange={e => handleMilestoneChange(idx, 'dueDate', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-900 block mb-0.5">
                        Acceptance Criteria (Verification Gate Standard) *
                      </label>
                      <input
                        type="text"
                        value={m.acceptanceCriteria}
                        onChange={e => handleMilestoneChange(idx, 'acceptanceCriteria', e.target.value)}
                        placeholder="Criteria required for completion approval..."
                        className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-900 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between bg-white/80">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-900 hover:text-gray-900">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
              >
                Proceed to Milestones Builder ➔
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900">
                ⬅ Back to Project Info
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Project & Quest Line</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


