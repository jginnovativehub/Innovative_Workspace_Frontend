import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { Edit3, X, Save, AlertTriangle, Calendar, Layers, Flag } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  users?: User[];
  onSaveProject: (id: number | string, data: any) => Promise<void>;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  users = [],
  onSaveProject
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [status, setStatus] = useState<string>('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [scope, setScope] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [ownerId, setOwnerId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setCode(project.code || '');
      setName(project.name || '');
      setObjective(project.objective || '');
      setPriority(project.priority || 'HIGH');
      setStatus(project.status || 'ACTIVE');
      setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
      setTargetDate(project.targetDate ? project.targetDate.split('T')[0] : '');
      setScope(project.scope || '');
      setDeliverables(project.deliverables || '');
      setOwnerId(project.ownerId !== undefined && project.ownerId !== null ? project.ownerId : '');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !objective.trim()) {
      toast.warning('Project Name, Code, and Objective are mandatory.', 'Required Fields');
      return;
    }

    setSaving(true);
    try {
      const targetId = (project.id !== undefined && project.id !== null) ? project.id : (project as any)._id;
      await onSaveProject(targetId, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        objective: objective.trim(),
        priority,
        status,
        startDate,
        targetDate,
        scope: scope.trim(),
        deliverables: deliverables.trim(),
        ownerId: ownerId !== '' ? Number(ownerId) : undefined
      });
      toast.success(`Project '${name}' successfully updated!`, 'Project Modified');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project', 'Update Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-indigo-200 rounded-2xl max-w-2xl w-full p-6 text-left shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-indigo-200">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Edit Project Details</h3>
              <p className="text-xs text-gray-600">Update project parameters, priority, schedule, and deliverables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Project Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Project Objective *</label>
            <textarea
              rows={2}
              required
              value={objective}
              onChange={e => setObjective(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
            />
          </div>

          {users && users.length > 0 && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Designated Initiative Lead / Owner
              </label>
              <select
                value={ownerId}
                onChange={e => setOwnerId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="">Executive Leadership</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role} - {u.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical Priority</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Project Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Target End Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Scope</label>
              <textarea
                rows={2}
                value={scope}
                onChange={e => setScope(e.target.value)}
                placeholder="Key scope boundaries..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Deliverables</label>
              <textarea
                rows={2}
                value={deliverables}
                onChange={e => setDeliverables(e.target.value)}
                placeholder="Key expected outputs..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2.5 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Project Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


