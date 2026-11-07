import express from 'express';

import {
  getStoreSettings,
  updateStoreSettings
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { DASHBOARD_ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/validation.js';

const router = express.Router();

// The storefront reads the hero image, so this endpoint is public.
router.get('/', asyncHandler(getStoreSettings));

// Staff and administrators can change the storefront appearance.
router.put('/', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(updateStoreSettings));

export default router;
