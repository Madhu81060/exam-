import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (ENV.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
