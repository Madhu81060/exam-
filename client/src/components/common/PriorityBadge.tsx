import React from 'react';
import { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let label = priority;
  let bgClass = 'bg-slate-50 text-slate-700 border-slate-200';

  switch (priority) {
    case 'LOW':
      label = 'Low';
      bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    case 'MEDIUM':
      label = 'Medium';
      bgClass = 'bg-pink-50 text-pink-700 border-pink-200';
      break;
    case 'HIGH':
      label = 'High';
      bgClass = 'bg-rose-100 text-rose-700 border-rose-300 font-medium';
      break;
    case 'CRITICAL':
      label = 'Critical';
      bgClass = 'bg-red-50 text-red-700 border-red-300 font-bold animate-pulse';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${bgClass}`}
    >
      {label}
    </span>
  );
};
