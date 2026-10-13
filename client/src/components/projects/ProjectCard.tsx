import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle2, Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Project } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const { user, isAdmin } = useAuth();
  const canManage = isAdmin || user?.id === project.createdById;
  const progress = project.taskStats?.progress || 0;
  const totalTasks = project.taskStats?.total || 0;
  const completedTasks = project.taskStats?.completed || 0;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/40 hover:shadow-pink-md hover:border-pink-200 transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              <StatusBadge status={project.status} type="project" />
              {project.isArchived && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Archived
                </span>
              )}
            </div>
            <Link
              to={`/projects/${project.id}`}
              className="text-base font-bold text-slate-800 hover:text-rose-600 transition-colors line-clamp-1 group-hover:text-rose-600"
            >
              {project.name}
            </Link>
          </div>

          {canManage && (
            <div className="flex items-center space-x-1 shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(project)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Edit project"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(project)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-rose-50">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
            <span>Progress</span>
            <span className="font-bold text-rose-600">{progress}%</span>
          </div>
          <div className="w-full bg-rose-50 rounded-full h-2 overflow-hidden border border-rose-100/60">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>
              {completedTasks} of {totalTasks} tasks completed
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-rose-50/30 border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-rose-400" />
          <span>Due {formatDate(project.deadline)}</span>
        </div>

        <div className="flex items-center space-x-1">
          <Users className="w-3.5 h-3.5 text-rose-400" />
          <span>{project.members?.length || 1} members</span>
        </div>
      </div>
    </div>
  );
};
