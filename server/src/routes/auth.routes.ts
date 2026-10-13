import { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  registerSchema,
  loginSchema,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;
