import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  CheckCircle2,
  ArrowUpDown,
  FolderKanban,
} from 'lucide-react';
import { taskApi } from '../api/task.api';
import { projectApi } from '../api/project.api';
import { Task, Pagination as PaginationType, TaskStatus, TaskPriority, Project } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const Tasks: React.FC = () => {
  const { user, isAdmin, isProjectManager } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    // Fetch user accessible projects for filter dropdown
    projectApi
      .getProjects({ limit: 100 })
      .then((res) => setProjects(res.data.projects))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [
    pagination.page,
    statusFilter,
    priorityFilter,
    projectFilter,
    sortBy,
    sortOrder,
    viewMode,
  ]);

  const fetchTasks = async (page = pagination.page) => {
    try {
      setIsLoading(true);
      // If kanban view, fetch up to 100 items without pagination split
      const limit = viewMode === 'kanban' ? 100 : pagination.limit;

      const res = await taskApi.getTasks({
        page: viewMode === 'kanban' ? 1 : page,
        limit,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        projectId: projectFilter || undefined,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
      });

      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks(1);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskApi.updateTask(taskId, { status: newStatus });
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskApi.deleteTask(taskId);
        fetchTasks();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleCreateOrUpdateTask = async (data: {
    title: string;
    description?: string;
    projectId: string;
    assignedToId?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
  }) => {
    if (selectedTask) {
      await taskApi.updateTask(selectedTask.id, data);
    } else {
      await taskApi.createTask(data);
    }
    fetchTasks(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Tasks & Workboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritize, assign, and track task lifecycles with drag-and-drop
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Kanban vs List Switcher */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-rose-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                  : 'text-slate-600 hover:bg-rose-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                  : 'text-slate-600 hover:bg-rose-50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/30 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-rose-50/30 border border-rose-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
          />
        </form>

        {/* Filter controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 text-xs">
          {/* Project dropdown */}
          <select
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="py-2 px-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 text-slate-700 max-w-[150px] truncate"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status dropdown */}
          {viewMode === 'list' && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="py-2 px-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          )}

          {/* Priority dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="py-2 px-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 px-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 text-slate-700"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <LoadingSpinner size="lg" label="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={
            searchQuery || statusFilter || priorityFilter || projectFilter
              ? 'Try adjusting your filters or search keyword.'
              : 'Create a task to kick off work and track deliverables.'
          }
          actionText="Create First Task"
          onAction={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          icon={<CheckCircle2 className="w-7 h-7" />}
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEditTask={(t) => {
            setSelectedTask(t);
            setIsModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          onAddTask={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={(t) => {
                  setSelectedTask(t);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(page) => fetchTasks(page)}
          />
        </>
      )}

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        initialData={selectedTask}
      />
    </div>
  );
};
