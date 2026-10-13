import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';

/**
 * Middleware to restrict endpoints to specific user roles
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Check if the user has access to a project (Admin, PM owner/member, or Member)
 */
export async function canAccessProject(
  userId: string,
  userRole: UserRole,
  projectId: string
): Promise<boolean> {
  if (userRole === 'ADMIN') return true;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!project) return false;

  // Project creator always has access
  if (project.createdById === userId) return true;

  // Member of project has access
  return project.members.length > 0;
}

/**
 * Check if the user has permission to manage (edit/delete/assign) a project
 */
export async function canManageProject(
  userId: string,
  userRole: UserRole,
  projectId: string
): Promise<boolean> {
  if (userRole === 'ADMIN') return true;

  if (userRole === 'PROJECT_MANAGER') {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId, role: { in: ['OWNER', 'MANAGER'] } },
        },
      },
    });

    if (!project) return false;
    if (project.createdById === userId) return true;
    return project.members.length > 0;
  }

  return false;
}
