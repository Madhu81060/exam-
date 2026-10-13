import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  createProjectSchema,
  updateProjectSchema,
} from '../controllers/project.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// List authorized projects (scoped based on role)
router.get('/', getProjects);

// Create project (Admin or Project Manager)
router.post(
  '/',
  requireRoles('ADMIN', 'PROJECT_MANAGER'),
  validate(createProjectSchema),
  createProject
);

// View project details
router.get('/:id', getProjectById);

// Update project (Admin or authorized Project Manager)
router.patch(
  '/:id',
  requireRoles('ADMIN', 'PROJECT_MANAGER'),
  validate(updateProjectSchema),
  updateProject
);

// Delete project (Admin or creator Project Manager)
router.delete(
  '/:id',
  requireRoles('ADMIN', 'PROJECT_MANAGER'),
  deleteProject
);

// Manage project members
router.post(
  '/:id/members',
  requireRoles('ADMIN', 'PROJECT_MANAGER'),
  addProjectMember
);

router.delete(
  '/:id/members/:userId',
  requireRoles('ADMIN', 'PROJECT_MANAGER'),
  removeProjectMember
);

export default router;
