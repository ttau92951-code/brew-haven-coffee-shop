import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { ROLES } from '../config/constants.js';
import { getCustomers, getEmployees, saveCustomers } from '../data/store.js';
import { toPublicEmployee } from './employeeController.js';
import { newId } from '../utils/ids.js';
import {
  ApiError,
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  isValidPhone
} from '../utils/validation.js';

const SALT_ROUNDS = 12;
const TOKEN_LIFETIME = '8h';

/** Removes sensitive fields before a customer is returned to the client. */
export function toPublicCustomer(customer) {
  const { passwordHash, ...publicFields } = customer;
  return publicFields;
}

function signToken(payload) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new ApiError(500, 'Authentication service is not configured.');
  }

  return jwt.sign(payload, secret, { expiresIn: TOKEN_LIFETIME });
}

/**
 * POST /api/auth/register
 * Creates a new customer account.
 */
export async function register(req, res) {
  const { fullName, email, phone, password, confirmPassword } = req.body || {};

  if (!isNonEmptyString(fullName)) {
    throw new ApiError(400, 'Full name is required.');
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid email address is required.');
  }

  if (!isValidPhone(phone)) {
    throw new ApiError(400, 'A valid phone number is required.');
  }

  if (!isValidPassword(password)) {
    throw new ApiError(400, 'Password must be at least 8 characters long.');
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const customers = await getCustomers();

  if (customers.some((customer) => customer.email === normalizedEmail)) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const now = new Date().toISOString();

  const customer = {
    id: newId(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    role: ROLES.CUSTOMER,
    createdAt: now,
    updatedAt: now
  };

  customers.push(customer);
  await saveCustomers(customers);

  const token = signToken({
    sub: customer.id,
    role: customer.role,
    name: customer.fullName,
    email: customer.email
  });

  res.status(201).json({
    success: true,
    message: 'Your account has been created successfully.',
    token,
    user: toPublicCustomer(customer)
  });
}

/**
 * POST /api/auth/login
 * Customer login using email and password.
 */
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const customers = await getCustomers();
  const customer = customers.find(
    (record) => record.email === email.trim().toLowerCase()
  );

  const passwordMatches = customer
    ? await bcrypt.compare(password, customer.passwordHash)
    : false;

  if (!customer || !passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken({
    sub: customer.id,
    role: customer.role,
    name: customer.fullName,
    email: customer.email
  });

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: toPublicCustomer(customer)
  });
}

/**
 * POST /api/auth/staff/login
 * Staff and administrators sign in with the work email and password an
 * administrator assigned to them. The bootstrap administrator defined in the
 * environment variables can still sign in with their configured username.
 */
export async function staffLogin(req, res) {
  const { username, email, password } = req.body || {};
  const identifier = String(email ?? username ?? '').trim();

  if (!identifier || typeof password !== 'string' || password.length === 0) {
    throw new ApiError(400, 'Your work email and password are required.');
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing from environment variables.');
    throw new ApiError(500, 'Staff authentication is not configured.');
  }

  // 1) Employees created by an administrator.
  const employees = await getEmployees();
  const employee = employees.find(
    (record) => record.email === identifier.toLowerCase()
  );

  if (employee) {
    if (employee.active === false) {
      throw new ApiError(
        403,
        'This account has been deactivated. Please contact an administrator.'
      );
    }

    const passwordMatches = await bcrypt.compare(password, employee.passwordHash);

    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = signToken({
      sub: employee.id,
      role: employee.role || ROLES.STAFF,
      name: employee.fullName,
      email: employee.email,
      username: employee.email
    });

    return res.json({
      success: true,
      message: `Welcome back, ${employee.fullName.split(' ')[0]}.`,
      token,
      user: toPublicEmployee(employee)
    });
  }

  // 2) The bootstrap administrator configured in the environment.
  const adminUsername = process.env.STAFF_USERNAME;
  const adminPasswordHash = process.env.STAFF_PASSWORD_HASH;

  if (
    !adminUsername ||
    !adminPasswordHash ||
    identifier.toLowerCase() !== adminUsername.toLowerCase()
  ) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, adminPasswordHash);

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken({
    sub: `staff:${adminUsername}`,
    role: ROLES.ADMIN,
    username: adminUsername,
    name: adminUsername
  });

  res.json({
    success: true,
    message: 'Administrator login successful.',
    token,
    user: {
      id: `staff:${adminUsername}`,
      username: adminUsername,
      name: adminUsername,
      email: '',
      position: 'Administrator',
      role: ROLES.ADMIN
    }
  });
}

/**
 * GET /api/auth/me
 * Returns the profile of the currently authenticated user.
 */
export async function me(req, res) {
  if (req.user.role === ROLES.STAFF) {
    const employees = await getEmployees();
    const employee = employees.find((record) => record.id === req.user.id);

    if (!employee) {
      throw new ApiError(404, 'Account not found.');
    }

    return res.json({ success: true, user: toPublicEmployee(employee) });
  }

  if (req.user.role === ROLES.ADMIN) {
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        name: req.user.name,
        email: '',
        position: 'Administrator',
        role: ROLES.ADMIN
      }
    });
  }

  const customers = await getCustomers();
  const customer = customers.find((record) => record.id === req.user.id);

  if (!customer) {
    throw new ApiError(404, 'Account not found.');
  }

  res.json({ success: true, user: toPublicCustomer(customer) });
}
