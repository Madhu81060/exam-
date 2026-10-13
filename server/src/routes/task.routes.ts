import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  createTaskSchema,
  updateTaskSchema,
  createCommentSchema,
} from '../controllers/task.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

// List and filter tasks
router.get('/', getTasks);

// Create task
router.post('/', validate(createTaskSchema), createTask);

// Get task details
router.get('/:id', getTaskById);

// Update task
router.patch('/:id', validate(updateTaskSchema), updateTask);

// Delete task
router.delete('/:id', deleteTask);

// Add comment to task
router.post('/:id/comments', validate(createCommentSchema), addComment);

export default router;
