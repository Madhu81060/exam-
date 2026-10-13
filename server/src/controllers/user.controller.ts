import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logActivity } from '../utils/activityLogger.js';

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']),
});

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, search } = req.query;

    const where: any = {};
    if (role && typeof role === 'string') {
      where.role = role;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            tasksAssigned: true,
            projectMembers: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUser = req.user!;
    const { id } = req.params;
    const { role } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    await logActivity({
      userId: adminUser.id,
      action: 'USER_ROLE_UPDATED',
      details: `Changed role of ${targetUser.name} (${targetUser.email}) to ${role}`,
    });

    res.status(200).json({
      success: true,
      message: `Role updated to ${role} successfully`,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
}
