import express from 'express';

import {
  createFeedback,
  listFeedback,
  listMyFeedback,
  listPublicReviews,
  replyToFeedback,
  updateFeedbackStatus
} from '../controllers/feedbackController.js';
import {
  authenticate,
  authorize,
  optionalAuthenticate
} from '../middleware/authMiddleware.js';
import { DASHBOARD_ROLES, ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/validation.js';

const router = express.Router();

// Staff and administrators manage and answer customer messages
router.get('/', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(listFeedback));
router.patch('/:id', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(updateFeedbackStatus));
router.post('/:id/reply', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(replyToFeedback));

// Customers read their own messages (declared before "/:id" style routes)
router.get('/me', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(listMyFeedback));

// Public: top-rated reviews shown on the home page
router.get('/public', asyncHandler(listPublicReviews));

// Customers and guests can leave a review, compliment or complaint
router.post('/', optionalAuthenticate, asyncHandler(createFeedback));

export default router;
