import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';

const app: Express = express();

// Security and middleware
app.use(cors({
  origin: ENV.CORS_ORIGIN === '*' ? true : [ENV.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply general API rate limiter
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// 404 Not Found route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
