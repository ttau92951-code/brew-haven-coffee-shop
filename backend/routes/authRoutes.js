import express from 'express';

import { login, me, register, staffLogin } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/validation.js';

const router = express.Router();

// Customer authentication
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Staff authentication
router.post('/staff/login', asyncHandler(staffLogin));

// Current session
router.get('/me', authenticate, asyncHandler(me));

export default router;
