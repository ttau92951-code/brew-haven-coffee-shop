import { getNotifications, saveNotifications } from '../data/store.js';
import { newId } from './ids.js';

// Keeps the Redis value small and the notification list readable.
const MAX_NOTIFICATIONS = 500;

/**
 * Creates a notification for a customer account.
 * Guest orders have no customerId, so there is nobody to notify and the
 * helper simply returns null.
 */
export async function createNotification(
  customerId,
  { type = 'system', title, message, orderId = null, orderNumber = null, link = null }
) {
  if (!customerId || !title || !message) {
    return null;
  }

  const notifications = await getNotifications();

  const notification = {
    id: newId(),
    customerId,
    type,
    title,
    message,
    orderId,
    orderNumber,
    link,
    read: false,
    readAt: null,
    createdAt: new Date().toISOString()
  };

  notifications.unshift(notification);
  await saveNotifications(notifications.slice(0, MAX_NOTIFICATIONS));

  return notification;
}
