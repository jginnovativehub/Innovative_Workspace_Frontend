import React, { useState } from 'react';
import { Project } from '../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onConfirmDelete: (projectId: number | string, reason: string) => Promise<void>;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onConfirmDelete
}) => {
  const [reason, setReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 5) {
      toast.warning('A documented justification of at least 5 characters is mandatory for permanent deletion.', 'Audit Justification Required');
      return;
    }

    setDeleting(true);
    try {
      const targetId = (project.id !== undefined && project.id !== null) ? project.id : (project as any)._id;
      await onConfirmDelete(targetId, reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project', 'Deletion Error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Permanently Delete Project</h3>
              <p className="text-xs text-rose-300">Irreversible Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
              {project.code}
            </span>
            <span className="font-bold text-sm text-white">{project.name}</span>
          </div>
          <p className="text-xs text-rose-200/80 pt-1">
            Deleting this project plan will permanently remove all associated milestones, tasks, and team memberships.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Documented Deletion Justification (Mandatory for Audit Trail) *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Provide reason for permanent deletion (e.g. Cancelled initiative, duplicate plan)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Deleting Plan...' : 'Permanently Delete Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

