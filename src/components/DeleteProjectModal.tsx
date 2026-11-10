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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-700 border border-rose-200">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Permanently Delete Project</h3>
              <p className="text-xs text-rose-700">Irreversible Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-500/20 rounded-xl space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-rose-700 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-200">
              {project.code}
            </span>
            <span className="font-bold text-sm text-gray-900">{project.name}</span>
          </div>
          <p className="text-xs text-rose-900/80 pt-1">
            Deleting this project plan will permanently remove all associated milestones, tasks, and team memberships.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Documented Deletion Justification (Mandatory for Audit Trail) *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Provide reason for permanent deletion (e.g. Cancelled initiative, duplicate plan)..."
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-colors"
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


