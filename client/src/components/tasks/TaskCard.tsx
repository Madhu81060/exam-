import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  showProject?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  showProject = true,
}) => {
  const { user, isAdmin, isProjectManager } = useAuth();
  const isAssignee = task.assignedToId === user?.id;
  const canModify = isAdmin || isProjectManager || isAssignee;
  const canDelete = isAdmin || isProjectManager || task.createdById === user?.id;

  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate).getTime() < Date.now();

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/30 hover:shadow-pink-md hover:border-pink-200 transition-all p-4 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {canModify && onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Project Name Pill (if enabled) */}
        {showProject && task.project && (
          <Link
            to={`/projects/${task.project.id}`}
            className="inline-block text-[11px] font-semibold text-rose-500 hover:text-rose-700 bg-rose-50/60 px-2 py-0.5 rounded-md mb-1.5 transition-colors"
          >
            {task.project.name}
          </Link>
        )}

        {/* Task Title */}
        <Link
          to={`/tasks/${task.id}`}
          className="block text-sm font-bold text-slate-800 hover:text-rose-600 transition-colors line-clamp-2 leading-snug"
        >
          {task.title}
        </Link>

        {/* Task Description */}
        {task.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Info: Assignee, Due Date, Comments, Status selector */}
      <div className="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between text-xs text-slate-500">
        {/* Assignee */}
        <div className="flex items-center space-x-1.5">
          {task.assignedTo ? (
            <div className="flex items-center space-x-1.5">
              <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-200 to-pink-200 text-rose-800 flex items-center justify-center font-bold text-[10px]">
                {task.assignedTo.name.charAt(0)}
              </span>
              <span className="text-[11px] font-medium text-slate-700 max-w-[80px] truncate">
                {task.assignedTo.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Unassigned</span>
          )}
        </div>

        {/* Due Date & Comments */}
        <div className="flex items-center space-x-3">
          {task.dueDate && (
            <span
              className={`flex items-center space-x-1 text-[11px] ${
                isOverdue ? 'text-red-600 font-bold' : 'text-slate-400'
              }`}
              title={isOverdue ? 'Task is overdue!' : 'Due date'}
            >
              {isOverdue && <AlertCircle className="w-3 h-3 text-red-500 animate-bounce" />}
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}

          <Link
            to={`/tasks/${task.id}`}
            className="flex items-center space-x-1 text-slate-400 hover:text-rose-600 transition-colors"
            title="Comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">
              {task._count?.comments || task.comments?.length || 0}
            </span>
          </Link>
        </div>
      </div>

      {/* Quick Status Bar */}
      {onStatusChange && canModify && (
        <div className="mt-2.5 pt-2 border-t border-dashed border-rose-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Move status:</span>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="text-[11px] font-semibold text-rose-600 bg-rose-50/70 border border-rose-200 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-rose-400 cursor-pointer"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      )}
    </div>
  );
};
