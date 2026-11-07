import express from 'express';

import {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  listMenu,
  updateMenuItem
} from '../controllers/menuController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { DASHBOARD_ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/validation.js';

const router = express.Router();

// Public menu endpoints
router.get('/', asyncHandler(listMenu));
router.get('/:id', asyncHandler(getMenuItem));

// Staff and administrator management endpoints
router.post('/', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(createMenuItem));
router.put('/:id', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(updateMenuItem));
router.delete('/:id', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(deleteMenuItem));

export default router;
