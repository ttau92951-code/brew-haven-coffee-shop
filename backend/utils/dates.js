/**
 * Date helpers used by the reporting module.
 * All helpers return local-time based keys so daily figures match the shop's day.
 */

export function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function endOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

/** Returns YYYY-MM-DD for a date. */
export function dayKey(date = new Date()) {
  const value = new Date(date);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

/** Returns YYYY-MM for a date. */
export function monthKey(date = new Date()) {
  const value = new Date(date);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  return `${value.getFullYear()}-${month}`;
}

/** Returns the Monday that starts the week containing the given date. */
export function startOfWeek(date = new Date()) {
  const value = startOfDay(date);
  const day = value.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

/** Adds a number of days to a date and returns a new date. */
export function addDays(date, amount) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

/** Adds a number of months to a date and returns a new date. */
export function addMonths(date, amount) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + amount);
  return value;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatDayLabel(date) {
  const value = new Date(date);
  return `${MONTH_NAMES[value.getMonth()]} ${value.getDate()}`;
}

export function formatMonthLabel(date) {
  const value = new Date(date);
  return `${MONTH_NAMES[value.getMonth()]} ${value.getFullYear()}`;
}
