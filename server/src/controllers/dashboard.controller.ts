import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getDashboardSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const now = new Date();

    // Project scope condition
    const projectScope: any = user.role === 'ADMIN'
      ? { isArchived: false }
      : {
          isArchived: false,
          OR: [
            { createdById: user.id },
            { members: { some: { userId: user.id } } },
          ],
        };

    // Task scope condition
    const taskScope: any = user.role === 'ADMIN'
      ? {}
      : {
          project: {
            OR: [
              { createdById: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        };

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      planningProjects,
      onHoldProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      inReviewTasks,
      doneTasks,
      overdueTasks,
      userTasksCount,
      userTodoTasks,
      userInProgressTasks,
      userInReviewTasks,
      userDoneTasks,
      recentActivities,
      upcomingTasks,
    ] = await Promise.all([
      // Projects
      prisma.project.count({ where: projectScope }),
      prisma.project.count({ where: { ...projectScope, status: 'ACTIVE' } }),
      prisma.project.count({ where: { ...projectScope, status: 'COMPLETED' } }),
      prisma.project.count({ where: { ...projectScope, status: 'PLANNING' } }),
      prisma.project.count({ where: { ...projectScope, status: 'ON_HOLD' } }),

      // Tasks
      prisma.task.count({ where: taskScope }),
      prisma.task.count({ where: { ...taskScope, status: 'TODO' } }),
      prisma.task.count({ where: { ...taskScope, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...taskScope, status: 'IN_REVIEW' } }),
      prisma.task.count({ where: { ...taskScope, status: 'DONE' } }),

      // Overdue tasks
      prisma.task.count({
        where: {
          ...taskScope,
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      }),

      // User assigned tasks
      prisma.task.count({ where: { assignedToId: user.id } }),
      prisma.task.count({ where: { assignedToId: user.id, status: 'TODO' } }),
      prisma.task.count({ where: { assignedToId: user.id, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { assignedToId: user.id, status: 'IN_REVIEW' } }),
      prisma.task.count({ where: { assignedToId: user.id, status: 'DONE' } }),

      // Recent activities
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, role: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),

      // Upcoming deadline tasks
      prisma.task.findMany({
        where: {
          ...taskScope,
          status: { not: 'DONE' },
          dueDate: { gte: now },
        },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
    ]);

    const projectCompletionPercentage =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          planning: planningProjects,
          onHold: onHoldProjects,
          completionPercentage: projectCompletionPercentage,
        },
        tasks: {
          total: totalTasks,
          byStatus: {
            TODO: todoTasks,
            IN_PROGRESS: inProgressTasks,
            IN_REVIEW: inReviewTasks,
            DONE: doneTasks,
          },
          overdue: overdueTasks,
        },
        userSummary: {
          assignedTotal: userTasksCount,
          byStatus: {
            TODO: userTodoTasks,
            IN_PROGRESS: userInProgressTasks,
            IN_REVIEW: userInReviewTasks,
            DONE: userDoneTasks,
          },
        },
        recentActivities,
        upcomingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
}
