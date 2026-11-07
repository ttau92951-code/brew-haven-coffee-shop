/**
 * Shared constants used across the Brew Haven API.
 */

// Key-value namespaces inside the Redis database.
export const REDIS_KEYS = {
  MENU: 'brew-haven:menu',
  ORDERS: 'brew-haven:orders',
  CUSTOMERS: 'brew-haven:customers',
  NOTIFICATIONS: 'brew-haven:notifications',
  FEEDBACK: 'brew-haven:feedback',
  EMPLOYEES: 'brew-haven:employees',
  SETTINGS: 'brew-haven:settings'
};

// The order lifecycle required by the assignment.
export const ORDER_STATUSES = [
  'Pending',
  'Preparing',
  'Ready',
  'Collected'
];

// Allowed menu categories shown on the customer website.
export const MENU_CATEGORIES = [
  'Coffee',
  'Tea',
  'Pastries',
  'Cold Drinks',
  'Desserts'
];

// Feedback a customer can leave for the coffee shop.
export const FEEDBACK_TYPES = ['Review', 'Compliment', 'Complaint'];

// How staff track each piece of feedback.
export const FEEDBACK_STATUSES = ['New', 'Read', 'Resolved'];

// Application roles used for role-based access control.
export const ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin'
};

// Roles allowed into the staff dashboard (administrators manage employees on top).
export const DASHBOARD_ROLES = [ROLES.STAFF, ROLES.ADMIN];

// Job titles an administrator can assign to a new employee.
export const EMPLOYEE_POSITIONS = [
  'Barista',
  'Cashier',
  'Shift Supervisor',
  'Baker',
  'Store Manager',
  'Other'
];

// Password rules (shared by controller validation and error messages).
export const PASSWORD_MIN_LENGTH = 8;
