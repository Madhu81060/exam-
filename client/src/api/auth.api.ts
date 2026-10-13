import api from './client';
import { User } from '../types';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData: { name: string; email: string; password: string; role?: string }): Promise<LoginResponse> => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  getMe: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
    }
  },
};
