import { PASSWORD_MIN_LENGTH } from '../config/constants.js';

/**
 * Error type that carries an HTTP status code.
 * Thrown inside controllers and translated by the global error handler.
 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

export function isValidPhone(value) {
  return typeof value === 'string' && PHONE_PATTERN.test(value.trim());
}

export function isValidPassword(value) {
  return typeof value === 'string' && value.length >= PASSWORD_MIN_LENGTH;
}

/**
 * Wraps an async route handler so rejected promises reach the error handler.
 */
export function asyncHandler(handler) {
  return (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}
