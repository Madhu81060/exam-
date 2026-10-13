import React from 'react';
import { ProjectStatus, TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus | string;
  type?: 'project' | 'task';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'task' }) => {
  let label = status;
  let bgClass = 'bg-rose-50 text-rose-700 border-rose-200';

  if (type === 'project') {
    switch (status) {
      case 'PLANNING':
        label = 'Planning';
        bgClass = 'bg-pink-50 text-pink-700 border-pink-200';
        break;
      case 'ACTIVE':
        label = 'Active';
        bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'ON_HOLD':
        label = 'On Hold';
        bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'COMPLETED':
        label = 'Completed';
        bgClass = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
        break;
    }
  } else {
    switch (status) {
      case 'TODO':
        label = 'To Do';
        bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
      case 'IN_PROGRESS':
        label = 'In Progress';
        bgClass = 'bg-pink-100 text-pink-800 border-pink-300 font-medium';
        break;
      case 'IN_REVIEW':
        label = 'In Review';
        bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'DONE':
        label = 'Done';
        bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${bgClass}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
};
