import express from 'express';

import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee
} from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/validation.js';

const router = express.Router();

// Only an administrator can manage the employee accounts.
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', asyncHandler(listEmployees));
router.post('/', asyncHandler(createEmployee));
router.put('/:id', asyncHandler(updateEmployee));
router.delete('/:id', asyncHandler(deleteEmployee));

export default router;
