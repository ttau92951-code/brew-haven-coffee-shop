import express from 'express';

import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import {
  authenticate,
  authorize,
  optionalAuthenticate
} from '../middleware/authMiddleware.js';
import { DASHBOARD_ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/validation.js';

const router = express.Router();

// Guests and customers can place an order
router.post('/', optionalAuthenticate, asyncHandler(createOrder));

// Staff and administrators can view every order
router.get('/', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(listOrders));

// Staff, administrators or the customer that owns the order
router.get('/:id', authenticate, asyncHandler(getOrder));

// Staff and administrators update the order status
router.patch(
  '/:id/status',
  authenticate,
  authorize(...DASHBOARD_ROLES),
  asyncHandler(updateOrderStatus)
);

export default router;
