import express from 'express';

import {
  deleteCustomer,
  getCustomer,
  getCustomerOrders,
  getMyOrders,
  getMyProfile,
  listCustomers,
  updateMyProfile
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { DASHBOARD_ROLES, ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/validation.js';

const router = express.Router();

// Current customer account ("me" routes must be declared before "/:id")
router.get('/me', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(getMyProfile));
router.put('/me', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(updateMyProfile));
router.get('/me/orders', authenticate, authorize(ROLES.CUSTOMER), asyncHandler(getMyOrders));

// Staff and administrator customer management
router.get('/', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(listCustomers));
router.get('/:id', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(getCustomer));
router.get('/:id/orders', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(getCustomerOrders));
router.delete('/:id', authenticate, authorize(...DASHBOARD_ROLES), asyncHandler(deleteCustomer));

export default router;
