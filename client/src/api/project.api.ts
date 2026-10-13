import api from './client';
import { Project, Pagination } from '../types';

export interface ProjectListResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: Pagination;
  };
}

export interface ProjectDetailResponse {
  success: boolean;
  data: {
    project: Project;
  };
}

export const projectApi = {
  getProjects: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeArchived?: boolean;
  }): Promise<ProjectListResponse> => {
    const res = await api.get('/projects', { params });
    return res.data;
  },

  getProjectById: async (id: string): Promise<ProjectDetailResponse> => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  createProject: async (data: {
    name: string;
    description?: string;
    startDate?: string | null;
    deadline?: string | null;
    status?: string;
    memberIds?: string[];
  }): Promise<ProjectDetailResponse> => {
    const res = await api.post('/projects', data);
    return res.data;
  },

  updateProject: async (
    id: string,
    data: {
      name?: string;
      description?: string | null;
      startDate?: string | null;
      deadline?: string | null;
      status?: string;
      isArchived?: boolean;
    }
  ): Promise<ProjectDetailResponse> => {
    const res = await api.patch(`/projects/${id}`, data);
    return res.data;
  },

  deleteProject: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  addMember: async (
    projectId: string,
    data: { userId: string; role?: string }
  ): Promise<{ success: boolean; data: { member: any } }> => {
    const res = await api.post(`/projects/${projectId}/members`, data);
    return res.data;
  },

  removeMember: async (
    projectId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return res.data;
  },
};
