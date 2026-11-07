import { getNotifications, saveNotifications } from '../data/store.js';
import { ApiError } from '../utils/validation.js';

function sortNewestFirst(records) {
  return [...records].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/** GET /api/notifications - the signed-in customer's notifications */
export async function listMyNotifications(req, res) {
  const notifications = await getNotifications();
  const mine = sortNewestFirst(
    notifications.filter((record) => record.customerId === req.user.id)
  );

  res.json({
    success: true,
    count: mine.length,
    unreadCount: mine.filter((record) => !record.read).length,
    data: mine
  });
}

/** PATCH /api/notifications/read-all - the signed-in customer's notifications */
export async function markAllNotificationsRead(req, res) {
  const notifications = await getNotifications();
  const now = new Date().toISOString();
  let updated = 0;

  const next = notifications.map((record) => {
    if (record.customerId === req.user.id && !record.read) {
      updated += 1;
      return { ...record, read: true, readAt: now };
    }

    return record;
  });

  await saveNotifications(next);

  res.json({
    success: true,
    message: `${updated} notification(s) marked as read.`,
    data: { updated }
  });
}

/** PATCH /api/notifications/:id/read - the signed-in customer's notification */
export async function markNotificationRead(req, res) {
  const notifications = await getNotifications();
  const index = notifications.findIndex((record) => record.id === req.params.id);

  if (index === -1) {
    throw new ApiError(404, 'Notification not found.');
  }

  if (notifications[index].customerId !== req.user.id) {
    throw new ApiError(403, 'You do not have permission to view this notification.');
  }

  notifications[index] = {
    ...notifications[index],
    read: true,
    readAt: new Date().toISOString()
  };

  await saveNotifications(notifications);

  res.json({
    success: true,
    message: 'Notification marked as read.',
    data: notifications[index]
  });
}
