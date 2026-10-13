import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination as PaginationType } from '../../types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-rose-100 rounded-xl shadow-sm mt-4 text-sm">
      <div className="text-slate-500">
        Showing page <span className="font-semibold text-slate-700">{page}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalPages}</span> ({total} items)
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-rose-200 text-slate-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsis = prev && p - prev > 1;

            return (
              <React.Fragment key={p}>
                {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                <button
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    p === page
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30 font-semibold'
                      : 'border border-rose-200 text-slate-600 hover:bg-rose-50'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-rose-200 text-slate-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
