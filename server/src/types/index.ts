import { Request } from 'express';

export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
