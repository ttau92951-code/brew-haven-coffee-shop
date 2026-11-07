import { randomUUID } from 'node:crypto';

/**
 * Generates a unique identifier for a stored record.
 */
export function newId() {
  return randomUUID();
}

/**
 * Generates a short, human friendly order number such as BH-M2K9X-4F1A.
 */
export function newOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = randomUUID().slice(0, 4).toUpperCase();
  return `BH-${stamp}-${random}`;
}
