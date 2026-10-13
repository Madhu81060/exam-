import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FolderPlus, ArrowUpDown } from 'lucide-react';
import { projectApi } from '../api/project.api';
import { Project, Pagination as PaginationType, ProjectStatus } from '../types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const Projects: React.FC = () => {
  const { isAdmin, isProjectManager } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [pagination.page, statusFilter, sortBy, sortOrder]);

  const fetchProjects = async (page = pagination.page) => {
    try {
      setIsLoading(true);
      const res = await projectApi.getProjects({
        page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
      });
      setProjects(res.data.projects);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects(1);
  };

  const handleCreateOrUpdate = async (data: {
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate?: string | null;
    deadline?: string | null;
    memberIds?: string[];
  }) => {
    if (selectedProject) {
      await projectApi.updateProject(selectedProject.id, data);
    } else {
      await projectApi.createProject(data);
    }
    fetchProjects(1);
  };

  const handleDelete = async (project: Project) => {
    if (window.confirm(`Are you sure you want to delete project "${project.name}"?`)) {
      try {
        await projectApi.deleteProject(project.id);
        fetchProjects(1);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  const canCreate = isAdmin || isProjectManager;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize work, deadlines, and team members across active initiatives
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setSelectedProject(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-pink-500/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-rose-50/30 border border-rose-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Status filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-xs py-2 px-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 text-slate-700"
            >
              <option value="createdAt">Date Created</option>
              <option value="deadline">Deadline</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" label="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={
            searchQuery || statusFilter
              ? 'Try modifying your search query or status filter.'
              : 'Create your first project to organize tasks and assign team members.'
          }
          actionText={canCreate ? 'Create First Project' : undefined}
          onAction={
            canCreate
              ? () => {
                  setSelectedProject(null);
                  setIsModalOpen(true);
                }
              : undefined
          }
          icon={<FolderPlus className="w-7 h-7" />}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => {
                  setSelectedProject(p);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(page) => fetchProjects(page)}
          />
        </>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedProject}
      />
    </div>
  );
};
