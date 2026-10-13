import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  UserMinus,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { projectApi } from '../api/project.api';
import { taskApi } from '../api/task.api';
import { Project, Task, TaskStatus, TaskPriority } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { ProjectModal } from '../components/projects/ProjectModal';
import { MemberModal } from '../components/projects/MemberModal';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { useAuth } from '../context/AuthContext';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isProjectManager } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await projectApi.getProjectById(id!);
      setProject(res.data.project);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskApi.updateTask(taskId, { status: newStatus });
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskApi.deleteTask(taskId);
        fetchProjectDetails();
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
    fetchProjectDetails();
  };

  const handleAddMember = async (userId: string, role: string) => {
    if (!id) return;
    await projectApi.addMember(id, { userId, role });
    fetchProjectDetails();
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    if (window.confirm('Remove this member from project?')) {
      await projectApi.removeMember(id, userId);
      fetchProjectDetails();
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this entire project?')) {
      await projectApi.deleteProject(id);
      navigate('/projects');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-sm max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Cannot View Project</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link
          to="/projects"
          className="mt-4 inline-flex items-center px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Projects
        </Link>
      </div>
    );
  }

  const canManage = isAdmin || user?.id === project.createdById;
  const tasks = project.tasks || [];
  const progress = project.taskStats?.progress || 0;
  const completedTasks = project.taskStats?.completed || 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Projects
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm shadow-pink-100/30">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2.5 mb-2.5 flex-wrap gap-y-1">
              <StatusBadge status={project.status} type="project" />
              <span className="text-xs text-slate-400">
                Created by <strong className="text-slate-700">{project.createdBy?.name}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {project.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-3xl">
              {project.description || 'No description provided.'}
            </p>

            {/* Dates row */}
            <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-rose-50 text-xs text-slate-500 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>
                  Start Date:{' '}
                  <strong className="text-slate-700">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : 'Not set'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>
                  Deadline:{' '}
                  <strong className="text-slate-700">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString()
                      : 'Not set'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {canManage && (
              <>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="p-2.5 rounded-xl border border-rose-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="p-2.5 rounded-xl border border-rose-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsTaskModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Task
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-5 border-t border-rose-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Overall Project Completion</span>
            <span className="font-bold text-rose-600 text-sm">{progress}%</span>
          </div>
          <div className="w-full bg-rose-50 rounded-full h-2.5 overflow-hidden border border-rose-100">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {completedTasks} of {tasks.length} tasks completed
          </p>
        </div>
      </div>

      {/* Team Members Strip */}
      <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm shadow-pink-100/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Assigned Team Members ({project.members?.length || 0})
            </h3>
          </div>

          {canManage && (
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Member
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {project.members?.map((m) => (
            <div
              key={m.id}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs"
            >
              <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-[10px]">
                {m.user.name.charAt(0)}
              </span>
              <span className="font-semibold text-slate-700">{m.user.name}</span>
              <span className="text-[10px] text-rose-500">({m.role})</span>

              {canManage && m.userId !== project.createdById && (
                <button
                  onClick={() => handleRemoveMember(m.userId)}
                  className="text-slate-400 hover:text-red-500 ml-1"
                  title="Remove Member"
                >
                  <UserMinus className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section Header with List / Kanban Toggle */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">Project Tasks</h2>
          <p className="text-xs text-slate-500">
            Track status, priorities, and assignments for this project
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-rose-200">
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
      </div>

      {/* Tasks View: Kanban or List */}
      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks in this project yet"
          description="Create your first task to start assigning responsibilities."
          actionText="Create Task"
          onAction={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
          icon={<CheckCircle2 className="w-7 h-7" />}
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleUpdateStatus}
          onEditTask={(t) => {
            setSelectedTask(t);
            setIsTaskModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          onAddTask={(st) => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showProject={false}
              onStatusChange={handleUpdateStatus}
              onEdit={(t) => {
                setSelectedTask(t);
                setIsTaskModalOpen(true);
              }}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Project Activity Log */}
      {project.activities && project.activities.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm shadow-pink-100/20">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Project Activity Timeline
            </h3>
          </div>
          <div className="space-y-3">
            {project.activities.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {act.user?.name ? act.user.name.charAt(0) : 'U'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 font-medium">
                    <span className="font-bold text-slate-900">{act.user?.name}</span> {act.details}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        initialData={selectedTask}
        defaultProjectId={project.id}
      />

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={async (data) => {
          await projectApi.updateProject(project.id, data);
          fetchProjectDetails();
        }}
        initialData={project}
      />

      {/* Add Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onAddMember={handleAddMember}
        existingMemberUserIds={project.members?.map((m) => m.userId) || []}
      />
    </div>
  );
};
