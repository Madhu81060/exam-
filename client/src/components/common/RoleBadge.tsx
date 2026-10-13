import React from 'react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole | string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  let label = role;
  let bgClass = 'bg-rose-50 text-rose-700 border-rose-200';

  switch (role) {
    case 'ADMIN':
      label = 'Admin';
      bgClass = 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-sm shadow-pink-500/20';
      break;
    case 'PROJECT_MANAGER':
      label = 'Project Manager';
      bgClass = 'bg-rose-100 text-rose-800 border-rose-200 font-medium';
      break;
    case 'TEAM_MEMBER':
      label = 'Team Member';
      bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
        role === 'ADMIN' ? bgClass : `border ${bgClass}`
      }`}
    >
      {label}
    </span>
  );
};
