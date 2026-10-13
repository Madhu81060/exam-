import api from './client';
import { User, UserRole } from '../types';

export const userApi = {
  getUsers: async (params?: { role?: string; search?: string }): Promise<{ success: boolean; data: { users: User[] } }> => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  updateUserRole: async (
    userId: string,
    role: UserRole
  ): Promise<{ success: boolean; message: string; data: { user: User } }> => {
    const res = await api.patch(`/users/${userId}/role`, { role });
    return res.data;
  },
};
