import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The page you requested does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Dashboard
      </Link>
    </div>
  );
};
