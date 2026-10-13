import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/30">
      <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4 border border-rose-200/60">
        {icon || <FolderOpen className="w-7 h-7 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-sm shadow-pink-500/25 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
