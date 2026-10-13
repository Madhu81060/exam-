import api from './client';
import { DashboardSummary } from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<{ success: boolean; data: DashboardSummary }> => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },
};
