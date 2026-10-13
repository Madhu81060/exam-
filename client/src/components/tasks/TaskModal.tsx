import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Task, TaskPriority, TaskStatus, Project, User } from '../../types';
import { projectApi } from '../../api/project.api';
import { userApi } from '../../api/user.api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    projectId: string;
    assignedToId?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
  }) => Promise<void>;
  initialData?: Task | null;
  defaultProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultProjectId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [assignedToId, setAssignedToId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setProjectId(initialData.projectId);
        setAssignedToId(initialData.assignedToId || '');
        setPriority(initialData.priority);
        setStatus(initialData.status);
        setDueDate(initialData.dueDate ? initialData.dueDate.slice(0, 10) : '');
      } else {
        setTitle('');
        setDescription('');
        setProjectId(defaultProjectId || '');
        setAssignedToId('');
        setPriority('MEDIUM');
        setStatus('TODO');
        setDueDate('');
      }
      setError(null);

      // Fetch projects
      projectApi
        .getProjects({ limit: 100 })
        .then((res) => {
          setProjects(res.data.projects);
          if (!defaultProjectId && !initialData && res.data.projects.length > 0) {
            setProjectId(res.data.projects[0].id);
          }
        })
        .catch(() => {});

      // Fetch users for assignee dropdown
      userApi
        .getUsers()
        .then((res) => setUsers(res.data.users))
        .catch(() => {});
    }
  }, [isOpen, initialData, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!projectId) {
      setError('Please select an associated project');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        projectId,
        assignedToId: assignedToId || null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create New Task'}
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
            Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement drag-and-drop Kanban view"
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
            placeholder="Provide context, acceptance criteria, or technical notes..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Project *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={!!defaultProjectId}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all disabled:bg-rose-50/50"
              required
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assignee
            </label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

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
            {isSubmitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
