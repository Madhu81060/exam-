import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { canAccessProject, canManageProject } from '../middleware/rbac.js';
import { logActivity } from '../utils/activityLogger.js';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional().nullable(),
  projectId: z.string().min(1, 'Project ID is required'),
  assignedToId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional().default('TODO'),
  dueDate: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  projectId: z.string().optional(),
  assignedToId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  dueDate: z.string().datetime().optional().nullable().or(z.string().optional().nullable()),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

export async function getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const {
      projectId,
      assignedToId,
      priority,
      status,
      search,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (projectId && typeof projectId === 'string') {
      where.projectId = projectId;
    }

    if (assignedToId && typeof assignedToId === 'string') {
      where.assignedToId = assignedToId;
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.title = { contains: search };
    }

    // Role-based visibility scoping
    if (user.role !== 'ADMIN') {
      // Must be in projects user has access to
      where.project = {
        OR: [
          { createdById: user.id },
          { members: { some: { userId: user.id } } },
        ],
      };
    }

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          project: {
            select: { id: true, name: true, status: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks,
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

export async function createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { title, description, projectId, assignedToId, priority, status, dueDate } = req.body;

    const hasAccess = await canAccessProject(user.id, user.role, projectId);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to create tasks in this project',
      });
      return;
    }

    // If assigned to a user, check that assignee exists
    if (assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
      if (!assignee) {
        res.status(400).json({ success: false, message: 'Assignee user not found' });
        return;
      }
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    if (parsedDueDate && isNaN(parsedDueDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid due date format' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToId: assignedToId || null,
        createdById: user.id,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: parsedDueDate,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'TASK_CREATED',
      details: `Created task "${task.title}"`,
      projectId: task.projectId,
      taskId: task.id,
    });

    if (task.assignedToId) {
      await logActivity({
        userId: user.id,
        action: 'TASK_ASSIGNED',
        details: `Assigned task "${task.title}" to ${task.assignedTo?.name || 'team member'}`,
        projectId: task.projectId,
        taskId: task.id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, status: true, createdById: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Role-based project permission check or direct assignee access
    const hasAccess =
      task.assignedToId === user.id ||
      (await canAccessProject(user.id, user.role, task.projectId));
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this task',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    if (!existingTask) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const hasAccess =
      existingTask.assignedToId === user.id ||
      (await canAccessProject(user.id, user.role, existingTask.projectId));
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
      return;
    }

    // Authorization logic:
    // If user is TEAM_MEMBER, they can only update status or reassign if assigned to them or member
    const isManagerOrAdmin = user.role === 'ADMIN' || user.role === 'PROJECT_MANAGER';
    const isAssignee = existingTask.assignedToId === user.id;

    const { title, description, priority, status, assignedToId, dueDate } = req.body;

    // Team members cannot delete or change overall project scope, but can change status
    if (!isManagerOrAdmin && !isAssignee && user.role === 'TEAM_MEMBER') {
      res.status(403).json({
        success: false,
        message: 'Team members can only update tasks assigned to them',
      });
      return;
    }

    const updateData: any = {};
    if (title !== undefined && isManagerOrAdmin) updateData.title = title;
    if (description !== undefined && isManagerOrAdmin) updateData.description = description;
    if (priority !== undefined && isManagerOrAdmin) updateData.priority = priority;
    if (assignedToId !== undefined && isManagerOrAdmin) updateData.assignedToId = assignedToId || null;
    if (dueDate !== undefined && isManagerOrAdmin) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    // Anyone authorized on the task can update status
    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Log status changes
    if (status && status !== existingTask.status) {
      await logActivity({
        userId: user.id,
        action: 'TASK_STATUS_CHANGED',
        details: `Status changed from "${existingTask.status}" to "${status}" on task "${updatedTask.title}"`,
        projectId: updatedTask.projectId,
        taskId: updatedTask.id,
      });
    }

    // Log assignment changes
    if (assignedToId !== undefined && assignedToId !== existingTask.assignedToId) {
      await logActivity({
        userId: user.id,
        action: 'TASK_REASSIGNED',
        details: `Task reassigned to ${updatedTask.assignedTo?.name || 'Unassigned'}`,
        projectId: updatedTask.projectId,
        taskId: updatedTask.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Only Admin or PM with manage rights can delete tasks
    const hasManage = await canManageProject(user.id, user.role, task.projectId);
    if (!hasManage && task.createdById !== user.id) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this task',
      });
      return;
    }

    await prisma.task.delete({ where: { id } });

    await logActivity({
      userId: user.id,
      action: 'TASK_DELETED',
      details: `Task "${task.title}" was deleted`,
      projectId: task.projectId,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id: taskId } = req.params;
    const { content } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const hasAccess =
      task.assignedToId === user.id ||
      (await canAccessProject(user.id, user.role, task.projectId));
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to comment on this task',
      });
      return;
    }

    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'COMMENT_ADDED',
      details: `Added a comment on task "${task.title}"`,
      projectId: task.projectId,
      taskId: task.id,
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
}
