import { ORDER_STATUSES, ROLES } from '../config/constants.js';
import { getMenu, getOrders, saveOrders } from '../data/store.js';
import { newId, newOrderNumber } from '../utils/ids.js';
import { createNotification } from '../utils/notifications.js';
import { ApiError, isNonEmptyString, isValidEmail, isValidPhone } from '../utils/validation.js';

// Messages pushed to the customer as their order moves along.
const STATUS_NOTIFICATIONS = {
  Pending: {
    title: 'Order received',
    message: (number) => `We have received order ${number} and will start on it shortly.`
  },
  Preparing: {
    title: 'Your order is being prepared',
    message: (number) => `Good news — our baristas are preparing order ${number} now.`
  },
  Ready: {
    title: 'Your order is ready ☕',
    message: (number) => `Order ${number} is ready for collection at Brew Haven!`
  },
  Collected: {
    title: 'Order collected',
    message: (number) => `Order ${number} has been collected. Enjoy, and thank you for visiting!`
  }
};

/**
 * POST /api/orders
 * Places a customer order. Works for guests and logged-in customers;
 * when a customer token is supplied the order is linked to their account.
 */
export async function createOrder(req, res) {
  const { customerName, phone, email, items, notes } = req.body || {};

  if (!isNonEmptyString(customerName)) {
    throw new ApiError(400, 'Customer name is required.');
  }

  if (!isValidPhone(phone)) {
    throw new ApiError(400, 'A valid contact number is required.');
  }

  if (email !== undefined && email !== '' && !isValidEmail(email)) {
    throw new ApiError(400, 'Please provide a valid email address.');
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new ApiError(400, 'An order must contain between 1 and 50 items.');
  }

  if (notes !== undefined && typeof notes !== 'string') {
    throw new ApiError(400, 'Order notes must be text.');
  }

  const menu = await getMenu();
  const orderItems = [];

  for (const requested of items) {
    if (!requested || typeof requested !== 'object') {
      throw new ApiError(400, 'Each order item must be an object.');
    }

    const menuItemId = requested.menuItemId ?? requested.itemId;
    const quantity = requested.quantity;

    if (
      typeof menuItemId !== 'string' ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      throw new ApiError(
        400,
        'Each item needs a valid menu item ID and a quantity between 1 and 99.'
      );
    }

    const product = menu.find((record) => record.id === menuItemId);

    if (!product) {
      throw new ApiError(400, 'One of the selected menu items no longer exists.');
    }

    if (!product.available) {
      throw new ApiError(400, `${product.name} is currently unavailable.`);
    }

    orderItems.push({
      menuItemId: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity,
      subtotal: product.price * quantity
    });
  }

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const now = new Date().toISOString();

  const order = {
    id: newId(),
    orderNumber: newOrderNumber(),
    customerId:
      req.user && req.user.role === ROLES.CUSTOMER ? req.user.id : null,
    customerName: customerName.trim(),
    email: email ? email.trim().toLowerCase() : '',
    phone: phone.trim(),
    items: orderItems,
    total,
    notes: notes ? notes.trim() : '',
    status: 'Pending',
    statusHistory: [{ status: 'Pending', at: now }],
    createdAt: now,
    updatedAt: now
  };

  const orders = await getOrders();
  orders.unshift(order);
  await saveOrders(orders);

  // Tell the customer their order was received (logged-in customers only).
  if (order.customerId) {
    await createNotification(order.customerId, {
      type: 'order_update',
      title: STATUS_NOTIFICATIONS.Pending.title,
      message: STATUS_NOTIFICATIONS.Pending.message(order.orderNumber),
      orderId: order.id,
      orderNumber: order.orderNumber,
      link: `/order/${order.id}`
    });
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: order
  });
}

/** GET /api/orders - staff only */
export async function listOrders(req, res) {
  const orders = await getOrders();
  res.json({ success: true, count: orders.length, data: orders });
}

/** GET /api/orders/:id - staff, or the customer who placed the order */
export async function getOrder(req, res) {
  const orders = await getOrders();
  const order = orders.find(
    (record) =>
      record.id === req.params.id || record.orderNumber === req.params.id
  );

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const isStaff =
    req.user.role === ROLES.STAFF || req.user.role === ROLES.ADMIN;
  const isOwner = order.customerId && order.customerId === req.user.id;

  if (!isStaff && !isOwner) {
    throw new ApiError(403, 'You do not have permission to view this order.');
  }

  res.json({ success: true, data: order });
}

/** PATCH /api/orders/:id/status - staff only */
export async function updateOrderStatus(req, res) {
  const { status } = req.body || {};

  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Use one of: ${ORDER_STATUSES.join(', ')}.`
    );
  }

  const orders = await getOrders();
  const index = orders.findIndex(
    (record) =>
      record.id === req.params.id || record.orderNumber === req.params.id
  );

  if (index === -1) {
    throw new ApiError(404, 'Order not found.');
  }

  const now = new Date().toISOString();

  orders[index] = {
    ...orders[index],
    status,
    updatedAt: now,
    statusHistory: [
      ...(orders[index].statusHistory || []),
      { status, at: now }
    ]
  };

  await saveOrders(orders);

  // Notify the customer whose order changed (e.g. "Ready for collection").
  const updated = orders[index];

  if (updated.customerId) {
    const template = STATUS_NOTIFICATIONS[status];

    await createNotification(updated.customerId, {
      type: 'order_update',
      title: template ? template.title : 'Order update',
      message: template
        ? template.message(updated.orderNumber)
        : `Order ${updated.orderNumber} is now ${status}.`,
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      link: `/order/${updated.id}`
    });
  }

  res.json({
    success: true,
    message: 'Order status updated successfully.',
    data: orders[index]
  });
}
