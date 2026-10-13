import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Project, ProjectStatus, User } from '../../types';
import { userApi } from '../../api/user.api';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate?: string | null;
    deadline?: string | null;
    memberIds?: string[];
  }) => Promise<void>;
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setStatus(initialData.status);
        setStartDate(initialData.startDate ? initialData.startDate.slice(0, 10) : '');
        setDeadline(initialData.deadline ? initialData.deadline.slice(0, 10) : '');
        setSelectedMembers(initialData.members?.map((m) => m.userId) || []);
      } else {
        setName('');
        setDescription('');
        setStatus('PLANNING');
        setStartDate(new Date().toISOString().slice(0, 10));
        setDeadline('');
        setSelectedMembers([]);
      }
      setError(null);

      // Fetch user list for member assignment
      userApi
        .getUsers()
        .then((res) => setUsers(res.data.users))
        .catch(() => {});
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        memberIds: selectedMembers,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Project' : 'Create New Project'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Project Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website Redesign"
            className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Outline objectives, deliverables, and scope..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Member assignment */}
        {!initialData && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Assign Team Members
            </label>
            <div className="max-h-36 overflow-y-auto p-2 border border-rose-100 rounded-xl space-y-1.5 bg-rose-50/20">
              {users.map((u) => {
                const isSelected = selectedMembers.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? 'bg-rose-100 text-rose-800 font-semibold'
                        : 'hover:bg-rose-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                        {u.name.charAt(0)}
                      </span>
                      <span>{u.name}</span>
                      <span className="text-[10px] text-slate-400">({u.role})</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-rose-500 focus:ring-rose-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-rose-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-rose-50/60 hover:bg-rose-100/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-md shadow-pink-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
