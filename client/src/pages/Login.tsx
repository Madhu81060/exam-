import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Shield, Briefcase, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 items-center justify-center text-white shadow-lg shadow-pink-500/30 mb-4 animate-in zoom-in-75">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">PinkSync</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to manage projects, tasks, and team collaborations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-pink-900/5 border border-rose-100">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-rose-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Quick Demo Logins (Click to autofill)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@projecthub.com')}
                className="flex flex-col items-center p-2 rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50/50 transition-colors text-center group"
              >
                <Shield className="w-4 h-4 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('pm@projecthub.com')}
                className="flex flex-col items-center p-2 rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50/50 transition-colors text-center group"
              >
                <Briefcase className="w-4 h-4 text-pink-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700">Manager</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('member@projecthub.com')}
                className="flex flex-col items-center p-2 rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50/50 transition-colors text-center group"
              >
                <UserCheck className="w-4 h-4 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700">Member</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-rose-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
