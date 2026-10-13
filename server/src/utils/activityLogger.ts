import prisma from '../config/prisma.js';

interface LogActivityParams {
  userId: string;
  action: string;
  details: string;
  projectId?: string | null;
  taskId?: string | null;
}

export async function logActivity({
  userId,
  action,
  details,
  projectId,
  taskId,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
        projectId: projectId || undefined,
        taskId: taskId || undefined,
      },
    });
  } catch (error) {
    // Activity logging should not fail the primary operation, but log to stderr
    console.error('Failed to log activity:', error);
  }
}
