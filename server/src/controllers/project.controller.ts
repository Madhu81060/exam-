import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { canAccessProject, canManageProject } from '../middleware/rbac.js';
import { logActivity } from '../utils/activityLogger.js';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  startDate: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
  deadline: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional().default('PLANNING'),
  memberIds: z.array(z.string()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
  deadline: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(),
  isArchived: z.boolean().optional(),
});

export async function getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const {
      status,
      search,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeArchived = 'false',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Filter conditions
    const where: any = {};

    // Archival filter
    if (includeArchived !== 'true') {
      where.isArchived = false;
    }

    // Status filter
    if (status && typeof status === 'string') {
      where.status = status;
    }

    // Search filter
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Role-based visibility
    if (user.role !== 'ADMIN') {
      // User must be creator or member
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { createdById: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      ];
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, role: true } },
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
          tasks: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
    ]);

    // Compute progress & stats for each project
    const formattedProjects = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const { tasks, ...rest } = p;
      return {
        ...rest,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          progress,
        },
      };
    });

    res.status(200).json({
      success: true,
      data: {
        projects: formattedProjects,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { name, description, startDate, deadline, status, memberIds } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'PLANNING',
        createdById: user.id,
        members: {
          create: [
            // Creator is always added as OWNER member
            { userId: user.id, role: 'OWNER' },
            // Additional initial members
            ...(memberIds && Array.isArray(memberIds)
              ? memberIds
                  .filter((id) => id !== user.id)
                  .map((mId: string) => ({ userId: mId, role: 'MEMBER' }))
              : []),
          ],
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'PROJECT_CREATED',
      details: `Project "${project.name}" was created`,
      projectId: project.id,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;

    const hasAccess = await canAccessProject(user.id, user.role, id);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this project',
      });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true, role: true } },
            createdBy: { select: { id: true, name: true, email: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        project: {
          ...project,
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            progress,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;

    const hasManage = await canManageProject(user.id, user.role, id);
    if (!hasManage) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this project',
      });
      return;
    }

    const { name, description, startDate, deadline, status, isArchived } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) updateData.status = status;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'PROJECT_UPDATED',
      details: `Project "${updated.name}" details updated`,
      projectId: updated.id,
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;

    const hasManage = await canManageProject(user.id, user.role, id);
    if (!hasManage) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this project',
      });
      return;
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id } });

    await logActivity({
      userId: user.id,
      action: 'PROJECT_DELETED',
      details: `Project "${project.name}" was deleted`,
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function addProjectMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id: projectId } = req.params;
    const { userId, role = 'MEMBER' } = req.body;

    const hasManage = await canManageProject(user.id, user.role, projectId);
    if (!hasManage) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to manage members of this project',
      });
      return;
    }

    const userToAdd = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToAdd) {
      res.status(404).json({ success: false, message: 'Target user not found' });
      return;
    }

    const member = await prisma.projectMember.upsert({
      where: {
        projectId_userId: { projectId, userId },
      },
      update: { role },
      create: { projectId, userId, role },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'MEMBER_ASSIGNED',
      details: `User ${userToAdd.name} was added to project with role ${role}`,
      projectId,
    });

    res.status(200).json({
      success: true,
      message: 'Member assigned successfully',
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeProjectMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id: projectId, userId } = req.params;

    const hasManage = await canManageProject(user.id, user.role, projectId);
    if (!hasManage) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to remove members from this project',
      });
      return;
    }

    await prisma.projectMember.deleteMany({
      where: { projectId, userId },
    });

    await logActivity({
      userId: user.id,
      action: 'MEMBER_REMOVED',
      details: `Member removed from project`,
      projectId,
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    next(error);
  }
}
