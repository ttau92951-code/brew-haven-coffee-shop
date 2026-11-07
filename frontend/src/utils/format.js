/** Formats a number as Maloti currency, e.g. M35.00 */
export function formatCurrency(value) {
  const amount = Number(value);
  return `M${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
}

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(value) {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '—';
  return `${formatDate(date)} · ${formatTime(date)}`;
}

/** Maps an order status to a badge modifier class. */
export function statusClass(status) {
  return `badge--${String(status || '').toLowerCase()}`;
}
