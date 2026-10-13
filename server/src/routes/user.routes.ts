import { Router } from 'express';
import {
  getUsers,
  updateUserRole,
  updateUserRoleSchema,
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

// All authenticated users can list team members (e.g. for task assignment dropdowns)
router.get('/', getUsers);

// Only Admins can modify user roles
router.patch(
  '/:id/role',
  requireRoles('ADMIN'),
  validate(updateUserRoleSchema),
  updateUserRole
);

export default router;
