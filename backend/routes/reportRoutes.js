import express from 'express';

import {
  dailyReport,
  monthlyReport,
  overview,
  weeklyReport
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { DASHBOARD_ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/validation.js';

const router = express.Router();

// Every reporting endpoint is staff and administrator only
router.use(authenticate, authorize(...DASHBOARD_ROLES));

router.get('/overview', asyncHandler(overview));
router.get('/daily', asyncHandler(dailyReport));
router.get('/weekly', asyncHandler(weeklyReport));
router.get('/monthly', asyncHandler(monthlyReport));

export default router;
