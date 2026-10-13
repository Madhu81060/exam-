import api from './client';
import { Task, Pagination, TaskComment } from '../types';

export interface TaskListResponse {
  success: boolean;
  data: {
    tasks: Task[];
    pagination: Pagination;
  };
}

export interface TaskDetailResponse {
  success: boolean;
  data: {
    task: Task;
  };
}

export const taskApi = {
  getTasks: async (params?: {
    projectId?: string;
    assignedToId?: string;
    priority?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<TaskListResponse> => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },

  getTaskById: async (id: string): Promise<TaskDetailResponse> => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  createTask: async (data: {
    title: string;
    description?: string;
    projectId: string;
    assignedToId?: string | null;
    priority?: string;
    status?: string;
    dueDate?: string | null;
  }): Promise<TaskDetailResponse> => {
    const res = await api.post('/tasks', data);
    return res.data;
  },

  updateTask: async (
    id: string,
    data: {
      title?: string;
      description?: string | null;
      projectId?: string;
      assignedToId?: string | null;
      priority?: string;
      status?: string;
      dueDate?: string | null;
    }
  ): Promise<TaskDetailResponse> => {
    const res = await api.patch(`/tasks/${id}`, data);
    return res.data;
  },

  deleteTask: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },

  addComment: async (
    taskId: string,
    data: { content: string }
  ): Promise<{ success: boolean; data: { comment: TaskComment } }> => {
    const res = await api.post(`/tasks/${taskId}/comments`, data);
    return res.data;
  },
};
