import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  AlertCircle,
  Clock,
  User,
  Send,
  Edit2,
  Trash2,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { taskApi } from '../api/task.api';
import { Task, TaskComment, TaskStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { RoleBadge } from '../components/common/RoleBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TaskModal } from '../components/tasks/TaskModal';
import { useAuth } from '../context/AuthContext';

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isProjectManager } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await taskApi.getTaskById(id!);
      setTask(res.data.task);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      await taskApi.updateTask(task.id, { status: newStatus });
      fetchTask();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change status');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      await taskApi.addComment(task.id, { content: commentText.trim() });
      setCommentText('');
      fetchTask();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (window.confirm('Delete this task?')) {
      try {
        await taskApi.deleteTask(task.id);
        navigate(`/projects/${task.projectId}`);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading task details..." />;
  }

  if (error || !task) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-sm max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Cannot View Task</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link
          to="/tasks"
          className="mt-4 inline-flex items-center px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Tasks
        </Link>
      </div>
    );
  }

  const isAssignee = task.assignedToId === user?.id;
  const canModify = isAdmin || isProjectManager || isAssignee;
  const canDelete = isAdmin || isProjectManager || task.createdById === user?.id;

  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate).getTime() < Date.now();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={task.project ? `/projects/${task.project.id}` : '/tasks'}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to{' '}
          {task.project?.name || 'Tasks'}
        </Link>
      </div>

      {/* Main Task Header Card */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm shadow-pink-100/30">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2.5 mb-2.5 flex-wrap gap-y-1">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {task.project && (
                <Link
                  to={`/projects/${task.project.id}`}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full"
                >
                  {task.project.name}
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {task.title}
            </h1>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {canModify && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2.5 rounded-xl border border-rose-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Edit Task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-xl border border-rose-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Task Meta Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-rose-50 text-xs text-slate-600">
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assignee
            </span>
            {task.assignedTo ? (
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-200 to-pink-200 text-rose-800 flex items-center justify-center font-bold text-[10px]">
                  {task.assignedTo.name.charAt(0)}
                </span>
                <span className="font-semibold text-slate-800">{task.assignedTo.name}</span>
              </div>
            ) : (
              <span className="text-slate-400 italic">Unassigned</span>
            )}
          </div>

          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Due Date
            </span>
            <div
              className={`flex items-center space-x-1.5 ${
                isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4 text-rose-400" />
              <span>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : 'Not set'}
              </span>
              {isOverdue && <span className="text-[10px] text-red-500 font-bold">(Overdue)</span>}
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Created By
            </span>
            <span className="font-medium text-slate-700">{task.createdBy?.name || 'System'}</span>
          </div>

          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Quick Status Update
            </span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-rose-400 cursor-pointer"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Comments and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comments Column (2 cols wide) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-rose-100 p-6 shadow-sm shadow-pink-100/20 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-rose-100">
            <MessageSquare className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Collaboration & Comments ({task.comments?.length || 0})
            </h3>
          </div>

          {/* Comment list */}
          <div className="space-y-4">
            {task.comments && task.comments.length > 0 ? (
              task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100/70 text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-[10px]">
                        {comment.author?.name ? comment.author.name.charAt(0) : 'U'}
                      </span>
                      <span className="font-bold text-slate-800">{comment.author?.name}</span>
                      <RoleBadge role={comment.author?.role || 'TEAM_MEMBER'} />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-8">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No comments yet. Start the conversation below!
              </p>
            )}
          </div>

          {/* New comment input */}
          <form onSubmit={handleAddComment} className="pt-2">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment or status update..."
                rows={3}
                className="w-full px-4 py-3 text-xs bg-rose-50/20 border border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 resize-none transition-all"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="absolute right-3 bottom-3 inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-sm shadow-pink-500/25 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isSubmittingComment ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </form>
        </div>

        {/* Task Activity Log (1 col wide) */}
        <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm shadow-pink-100/20 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-rose-100">
            <Activity className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Task History
            </h3>
          </div>

          {task.activities && task.activities.length > 0 ? (
            <div className="space-y-3.5 text-xs">
              {task.activities.map((act) => (
                <div key={act.id} className="relative pl-5 border-l-2 border-rose-200">
                  <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-rose-500" />
                  <p className="text-slate-700 font-medium leading-snug">
                    <strong className="text-slate-900">{act.user?.name}</strong>: {act.details}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              No activity logs recorded yet.
            </p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (data) => {
          await taskApi.updateTask(task.id, data);
          fetchTask();
        }}
        initialData={task}
        defaultProjectId={task.projectId}
      />
    </div>
  );
};
