import bcrypt from 'bcryptjs';

import { toPublicCustomer } from './authController.js';
import { ROLES, DASHBOARD_ROLES } from '../config/constants.js';
import { getCustomers, getOrders, saveCustomers } from '../data/store.js';
import {
  ApiError,
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  isValidPhone
} from '../utils/validation.js';

const SALT_ROUNDS = 12;

function findCustomer(customers, id) {
  return customers.find((record) => record.id === id);
}

/** GET /api/customers/me - customer only */
export async function getMyProfile(req, res) {
  const customers = await getCustomers();
  const customer = findCustomer(customers, req.user.id);

  if (!customer) {
    throw new ApiError(404, 'Account not found.');
  }

  res.json({ success: true, data: toPublicCustomer(customer) });
}

/** PUT /api/customers/me - customer only */
export async function updateMyProfile(req, res) {
  const customers = await getCustomers();
  const index = customers.findIndex((record) => record.id === req.user.id);

  if (index === -1) {
    throw new ApiError(404, 'Account not found.');
  }

  const { fullName, phone, email, currentPassword, newPassword } = req.body || {};
  const current = customers[index];
  const updates = {};

  if (fullName !== undefined) {
    if (!isNonEmptyString(fullName)) {
      throw new ApiError(400, 'Full name cannot be empty.');
    }
    updates.fullName = fullName.trim();
  }

  if (phone !== undefined) {
    if (!isValidPhone(phone)) {
      throw new ApiError(400, 'Please provide a valid phone number.');
    }
    updates.phone = phone.trim();
  }

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      throw new ApiError(400, 'Please provide a valid email address.');
    }

    const normalized = email.trim().toLowerCase();

    if (customers.some((record) => record.email === normalized && record.id !== current.id)) {
      throw new ApiError(409, 'Another account already uses this email address.');
    }

    updates.email = normalized;
  }

  if (newPassword !== undefined) {
    if (!isValidPassword(newPassword)) {
      throw new ApiError(400, 'New password must be at least 8 characters long.');
    }

    const matches = await bcrypt.compare(currentPassword || '', current.passwordHash);

    if (!matches) {
      throw new ApiError(401, 'Your current password is incorrect.');
    }

    updates.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  customers[index] = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await saveCustomers(customers);

  res.json({
    success: true,
    message: 'Your profile has been updated.',
    data: toPublicCustomer(customers[index])
  });
}

/** GET /api/customers/me/orders - customer only */
export async function getMyOrders(req, res) {
  const orders = await getOrders();
  const mine = orders.filter((order) => order.customerId === req.user.id);

  res.json({ success: true, count: mine.length, data: mine });
}

/** GET /api/customers - staff only */
export async function listCustomers(req, res) {
  const customers = await getCustomers();
  const orders = await getOrders();

  const data = customers.map((customer) => {
    const customerOrders = orders.filter(
      (order) => order.customerId === customer.id
    );

    return {
      ...toPublicCustomer(customer),
      orderCount: customerOrders.length,
      totalSpent: customerOrders.reduce(
        (sum, order) => sum + (Number(order.total) || 0),
        0
      )
    };
  });

  res.json({ success: true, count: data.length, data });
}

/** GET /api/customers/:id - staff only */
export async function getCustomer(req, res) {
  const customers = await getCustomers();
  const customer = findCustomer(customers, req.params.id);

  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }

  res.json({ success: true, data: toPublicCustomer(customer) });
}

/** GET /api/customers/:id/orders - staff only */
export async function getCustomerOrders(req, res) {
  const customers = await getCustomers();

  if (!findCustomer(customers, req.params.id)) {
    throw new ApiError(404, 'Customer not found.');
  }

  const orders = await getOrders();
  const customerOrders = orders.filter(
    (order) => order.customerId === req.params.id
  );

  res.json({ success: true, count: customerOrders.length, data: customerOrders });
}

/** DELETE /api/customers/:id - staff only */
export async function deleteCustomer(req, res) {
  const customers = await getCustomers();
  const index = customers.findIndex((record) => record.id === req.params.id);

  if (index === -1) {
    throw new ApiError(404, 'Customer not found.');
  }

  if (DASHBOARD_ROLES.includes(customers[index].role)) {
    throw new ApiError(403, 'Staff accounts cannot be removed here.');
  }

  const [deleted] = customers.splice(index, 1);
  await saveCustomers(customers);

  res.json({
    success: true,
    message: 'Customer account removed.',
    data: toPublicCustomer(deleted)
  });
}
