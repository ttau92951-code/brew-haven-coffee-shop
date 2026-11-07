import { redis } from '../config/redis.js';
import { REDIS_KEYS } from '../config/constants.js';
import { seedMenu } from './seedMenu.js';

/**
 * Reads a JSON collection from Redis.
 * The Upstash client may return either a parsed value or a raw string,
 * so both cases are handled.
 */
export async function readCollection(key) {
  const stored = await redis.get(key);

  if (stored === null || stored === undefined) {
    return [];
  }

  if (typeof stored === 'string') {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  }

  return Array.isArray(stored) ? stored : [];
}

/**
 * Persists a JSON collection to Redis.
 */
export async function writeCollection(key, records) {
  await redis.set(key, JSON.stringify(records));
  return records;
}

/**
 * Reads a single JSON object from Redis (used for store-wide settings).
 */
export async function readObject(key) {
  const stored = await redis.get(key);

  if (stored === null || stored === undefined) {
    return {};
  }

  const value = typeof stored === 'string' ? JSON.parse(stored) : stored;

  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

/**
 * Persists a single JSON object to Redis.
 */
export async function writeObject(key, value) {
  await redis.set(key, JSON.stringify(value));
  return value;
}

export const getMenu = () => readCollection(REDIS_KEYS.MENU);
export const saveMenu = (menu) => writeCollection(REDIS_KEYS.MENU, menu);

export const getOrders = () => readCollection(REDIS_KEYS.ORDERS);
export const saveOrders = (orders) => writeCollection(REDIS_KEYS.ORDERS, orders);

export const getCustomers = () => readCollection(REDIS_KEYS.CUSTOMERS);
export const saveCustomers = (customers) =>
  writeCollection(REDIS_KEYS.CUSTOMERS, customers);

export const getNotifications = () => readCollection(REDIS_KEYS.NOTIFICATIONS);
export const saveNotifications = (notifications) =>
  writeCollection(REDIS_KEYS.NOTIFICATIONS, notifications);

export const getFeedback = () => readCollection(REDIS_KEYS.FEEDBACK);
export const saveFeedback = (feedback) =>
  writeCollection(REDIS_KEYS.FEEDBACK, feedback);

export const getEmployees = () => readCollection(REDIS_KEYS.EMPLOYEES);
export const saveEmployees = (employees) =>
  writeCollection(REDIS_KEYS.EMPLOYEES, employees);

export const getSettings = () => readObject(REDIS_KEYS.SETTINGS);
export const saveSettings = (settings) => writeObject(REDIS_KEYS.SETTINGS, settings);

/**
 * Seeds the database with the default menu the first time the app starts.
 * Orders and customers are created by users, so they are left untouched.
 */
export async function seedDatabase() {
  const menu = await readCollection(REDIS_KEYS.MENU);

  if (menu.length === 0) {
    await saveMenu(seedMenu);
    console.log(`Seeded ${seedMenu.length} menu items into Redis.`);
  }
}
