import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest, AuthUser, UserRole } from '../types/index.js';

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    next(error);
  }
}
