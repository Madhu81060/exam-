export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt?: string;
  _count?: {
    tasksAssigned?: number;
    projectMembers?: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  deadline?: string | null;
  status: ProjectStatus;
  isArchived: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  members?: ProjectMember[];
  tasks?: Task[];
  taskStats?: {
    total: number;
    completed: number;
    progress: number;
  };
  _count?: {
    tasks: number;
  };
  activities?: ActivityLog[];
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  projectId?: string | null;
  taskId?: string | null;
  createdAt: string;
  user?: User;
  project?: { id: string; name: string };
  task?: { id: string; title: string };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  assignedToId?: string | null;
  createdById: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    status?: ProjectStatus;
  };
  assignedTo?: User | null;
  createdBy?: User;
  comments?: TaskComment[];
  activities?: ActivityLog[];
  _count?: {
    comments: number;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardSummary {
  projects: {
    total: number;
    active: number;
    completed: number;
    planning: number;
    onHold: number;
    completionPercentage: number;
  };
  tasks: {
    total: number;
    byStatus: {
      TODO: number;
      IN_PROGRESS: number;
      IN_REVIEW: number;
      DONE: number;
    };
    overdue: number;
  };
  userSummary: {
    assignedTotal: number;
    byStatus: {
      TODO: number;
      IN_PROGRESS: number;
      IN_REVIEW: number;
      DONE: number;
    };
  };
  recentActivities: ActivityLog[];
  upcomingTasks: Task[];
}
