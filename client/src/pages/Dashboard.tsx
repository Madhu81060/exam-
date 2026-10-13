import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  Plus,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboard.api';
import { DashboardSummary } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RoleBadge } from '../components/common/RoleBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const Dashboard: React.FC = () => {
  const { user, isAdmin, isProjectManager } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await dashboardApi.getSummary();
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Computing real-time workspace metrics..." />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-sm">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Error Loading Dashboard</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { projects, tasks, userSummary, recentActivities, upcomingTasks } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-pink-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none transform translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                Workspace Dashboard
              </span>
              <span className="text-rose-100 text-xs">Role: {user?.role}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-1 text-sm text-rose-100 max-w-xl leading-relaxed">
              Here is your team's real-time project progress, active tasks, and upcoming milestones.
            </p>
          </div>

          {(isAdmin || isProjectManager) && (
            <div className="flex items-center space-x-3 shrink-0">
              <Link
                to="/projects"
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-rose-600 font-bold text-xs hover:bg-rose-50 shadow-md transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Manage Projects
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/40 hover:border-pink-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-800">{projects.total}</div>
            <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">{projects.active} Active</span>
              <span>•</span>
              <span className="font-semibold text-rose-600">{projects.completed} Completed</span>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/40 hover:border-pink-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completion Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-800">
              {projects.completionPercentage}%
            </div>
            <div className="w-full bg-rose-50 rounded-full h-2 mt-3 overflow-hidden border border-rose-100/60">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${projects.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/40 hover:border-pink-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-800">{tasks.total}</div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-slate-500">
              <span className="text-pink-600 font-semibold">{tasks.byStatus.IN_PROGRESS} in flight</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{tasks.byStatus.DONE} done</span>
            </div>
          </div>
        </div>

        {/* Overdue Alert or Assigned to You */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            tasks.overdue > 0
              ? 'bg-rose-50/50 border-rose-300 shadow-sm shadow-rose-200/50'
              : 'bg-white border-rose-100 shadow-sm shadow-pink-100/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                tasks.overdue > 0 ? 'text-rose-700' : 'text-slate-400'
              }`}
            >
              Overdue Tasks
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                tasks.overdue > 0
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-3xl font-extrabold ${
                tasks.overdue > 0 ? 'text-rose-700' : 'text-slate-800'
              }`}
            >
              {tasks.overdue}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {tasks.overdue > 0
                ? 'Tasks requiring immediate attention'
                : 'All deadlines are currently on track!'}
            </p>
          </div>
        </div>
      </div>

      {/* Task Status Breakdown Bar */}
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Tasks By Status Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Live status distribution calculated from database records
            </p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center"
          >
            Open Tasks Board <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Progress Bar Stack */}
        <div className="w-full bg-slate-100 rounded-xl h-3.5 flex overflow-hidden p-0.5 space-x-1">
          {tasks.total > 0 ? (
            <>
              <div
                style={{ width: `${(tasks.byStatus.TODO / tasks.total) * 100}%` }}
                className="bg-slate-400 h-full rounded-md transition-all"
                title={`To Do: ${tasks.byStatus.TODO}`}
              />
              <div
                style={{ width: `${(tasks.byStatus.IN_PROGRESS / tasks.total) * 100}%` }}
                className="bg-pink-500 h-full rounded-md transition-all"
                title={`In Progress: ${tasks.byStatus.IN_PROGRESS}`}
              />
              <div
                style={{ width: `${(tasks.byStatus.IN_REVIEW / tasks.total) * 100}%` }}
                className="bg-purple-500 h-full rounded-md transition-all"
                title={`In Review: ${tasks.byStatus.IN_REVIEW}`}
              />
              <div
                style={{ width: `${(tasks.byStatus.DONE / tasks.total) * 100}%` }}
                className="bg-emerald-500 h-full rounded-md transition-all"
                title={`Done: ${tasks.byStatus.DONE}`}
              />
            </>
          ) : (
            <div className="w-full bg-slate-200 h-full rounded-md" />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-rose-50 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-600">To Do:</span>
            <span className="font-bold text-slate-800">{tasks.byStatus.TODO}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span className="text-slate-600">In Progress:</span>
            <span className="font-bold text-pink-700">{tasks.byStatus.IN_PROGRESS}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-600">In Review:</span>
            <span className="font-bold text-purple-700">{tasks.byStatus.IN_REVIEW}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Done:</span>
            <span className="font-bold text-emerald-700">{tasks.byStatus.DONE}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Tasks & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Upcoming Deadlines
              </h3>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              View all
            </Link>
          </div>

          {upcomingTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No pending tasks with approaching deadlines.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-rose-50 hover:border-rose-200 hover:bg-rose-50/20 transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <Link
                      to={`/tasks/${t.id}`}
                      className="text-xs font-bold text-slate-800 hover:text-rose-600 truncate block"
                    >
                      {t.title}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                      <span>{t.project?.name}</span>
                      <span>•</span>
                      <span className="text-rose-600 font-medium">
                        Due{' '}
                        {t.dueDate
                          ? new Date(t.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Activity History */}
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/30">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Recent Workspace Activity
            </h3>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No recorded activity yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {act.user?.name ? act.user.name.charAt(0) : 'U'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 font-medium leading-relaxed">
                      <span className="font-bold text-slate-900">{act.user?.name}</span>{' '}
                      {act.details}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
