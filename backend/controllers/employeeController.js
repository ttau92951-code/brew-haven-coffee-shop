import bcrypt from 'bcryptjs';

import { ROLES } from '../config/constants.js';
import { getEmployees, saveEmployees } from '../data/store.js';
import { newId } from '../utils/ids.js';
import {
  ApiError,
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  isValidPhone
} from '../utils/validation.js';

const SALT_ROUNDS = 12;

/** Removes the password hash before an employee is returned to the client. */
export function toPublicEmployee(employee) {
  const { passwordHash, ...publicFields } = employee;
  return publicFields;
}

function findEmployee(employees, id) {
  return employees.find((employee) => employee.id === id);
}

function assertEmailAvailable(employees, email, ignoredId = null) {
  const taken = employees.some(
    (employee) => employee.email === email && employee.id !== ignoredId
  );

  if (taken) {
    throw new ApiError(409, 'Another employee already uses this work email.');
  }
}

/** GET /api/employees - administrators only */
export async function listEmployees(req, res) {
  const employees = await getEmployees();

  const records = [...employees]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(toPublicEmployee);

  res.json({ success: true, count: records.length, data: records });
}

/** POST /api/employees - administrators only */
export async function createEmployee(req, res) {
  const { fullName, email, phone, position, password } = req.body || {};

  if (!isNonEmptyString(fullName)) {
    throw new ApiError(400, 'The employee\u2019s full name is required.');
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'A valid work email address is required.');
  }

  if (phone !== undefined && phone !== '' && !isValidPhone(phone)) {
    throw new ApiError(400, 'Please provide a valid phone number.');
  }

  if (!isValidPassword(password)) {
    throw new ApiError(400, 'The assigned password must be at least 8 characters long.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const employees = await getEmployees();

  assertEmailAvailable(employees, normalizedEmail);

  const now = new Date().toISOString();

  const employee = {
    id: newId(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : '',
    position: isNonEmptyString(position) ? position.trim() : 'Barista',
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    role: ROLES.STAFF,
    active: true,
    createdAt: now,
    updatedAt: now
  };

  employees.push(employee);
  await saveEmployees(employees);

  res.status(201).json({
    success: true,
    message: `${employee.fullName} can now sign in with their work email.`,
    data: toPublicEmployee(employee)
  });
}

/** PUT /api/employees/:id - administrators only */
export async function updateEmployee(req, res) {
  const { fullName, email, phone, position, password, active } = req.body || {};

  const employees = await getEmployees();
  const index = employees.findIndex((employee) => employee.id === req.params.id);

  if (index === -1) {
    throw new ApiError(404, 'Employee not found.');
  }

  const current = employees[index];
  const updated = { ...current, updatedAt: new Date().toISOString() };

  if (fullName !== undefined) {
    if (!isNonEmptyString(fullName)) {
      throw new ApiError(400, 'The employee\u2019s full name is required.');
    }
    updated.fullName = fullName.trim();
  }

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      throw new ApiError(400, 'A valid work email address is required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    assertEmailAvailable(employees, normalizedEmail, current.id);
    updated.email = normalizedEmail;
  }

  if (phone !== undefined) {
    if (phone !== '' && !isValidPhone(phone)) {
      throw new ApiError(400, 'Please provide a valid phone number.');
    }
    updated.phone = phone ? phone.trim() : '';
  }

  if (position !== undefined && isNonEmptyString(position)) {
    updated.position = position.trim();
  }

  if (active !== undefined) {
    updated.active = Boolean(active);
  }

  // An administrator can assign a brand-new password at any time.
  if (password !== undefined && password !== '') {
    if (!isValidPassword(password)) {
      throw new ApiError(400, 'The assigned password must be at least 8 characters long.');
    }
    updated.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  employees[index] = updated;
  await saveEmployees(employees);

  res.json({
    success: true,
    message: `${updated.fullName}\u2019s details were updated.`,
    data: toPublicEmployee(updated)
  });
}

/** DELETE /api/employees/:id - administrators only */
export async function deleteEmployee(req, res) {
  const employees = await getEmployees();
  const employee = findEmployee(employees, req.params.id);

  if (!employee) {
    throw new ApiError(404, 'Employee not found.');
  }

  await saveEmployees(employees.filter((record) => record.id !== employee.id));

  res.json({
    success: true,
    message: `${employee.fullName} was removed from the team.`
  });
}
