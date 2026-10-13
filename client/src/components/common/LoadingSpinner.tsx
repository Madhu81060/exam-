import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', label = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-rose-500">
      <div
        className={`${sizeClasses[size]} rounded-full border-rose-200 border-t-rose-600 animate-spin`}
      />
      {label && <p className="mt-3 text-sm text-slate-500 font-medium">{label}</p>}
    </div>
  );
};
