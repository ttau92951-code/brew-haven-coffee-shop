import { ORDER_STATUSES } from '../config/constants.js';
import { getCustomers, getMenu, getOrders } from '../data/store.js';
import {
  addDays,
  addMonths,
  dayKey,
  formatDayLabel,
  formatMonthLabel,
  monthKey,
  startOfDay,
  startOfWeek
} from '../utils/dates.js';

const round = (value) => Math.round(value * 100) / 100;

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Builds empty buckets for the given keys and fills them with real order data.
 * Orders outside the requested range are ignored.
 */
function aggregate(orders, buckets, keyFor) {
  const map = new Map(
    buckets.map((bucket) => [bucket.key, { ...bucket, orders: 0, revenue: 0 }])
  );

  for (const order of orders) {
    const created = toDate(order.createdAt);

    if (!created) {
      continue;
    }

    const key = keyFor(created);
    const bucket = map.get(key);

    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += Number(order.total) || 0;
    }
  }

  return [...map.values()].map((bucket) => ({
    ...bucket,
    revenue: round(bucket.revenue)
  }));
}

function summarise(buckets) {
  return {
    orders: buckets.reduce((sum, bucket) => sum + bucket.orders, 0),
    revenue: round(buckets.reduce((sum, bucket) => sum + bucket.revenue, 0))
  };
}

/** Aggregates the best selling products from real order data. */
function computeBestSellers(orders, limit = 5) {
  const tally = new Map();

  for (const order of orders) {
    for (const item of order.items || []) {
      const key = item.menuItemId || item.name;
      const entry = tally.get(key) || {
        menuItemId: item.menuItemId,
        name: item.name,
        category: item.category || '',
        quantity: 0,
        revenue: 0
      };

      entry.quantity += item.quantity;
      entry.revenue += item.subtotal ?? item.price * item.quantity;
      tally.set(key, entry);
    }
  }

  return [...tally.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
    .map((entry) => ({ ...entry, revenue: round(entry.revenue) }));
}

/** GET /api/reports/overview - staff only */
export async function overview(req, res) {
  const [orders, customers, menu] = await Promise.all([
    getOrders(),
    getCustomers(),
    getMenu()
  ]);

  const todayKey = dayKey(new Date());
  const todayOrders = orders.filter((order) => {
    const created = toDate(order.createdAt);
    return created && dayKey(created) === todayKey;
  });

  const revenueTotal = orders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );
  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  const statusCounts = ORDER_STATUSES.reduce((accumulator, status) => {
    accumulator[status] = orders.filter((order) => order.status === status).length;
    return accumulator;
  }, {});

  res.json({
    success: true,
    data: {
      totals: {
        orders: orders.length,
        customers: customers.length,
        menuItems: menu.length
      },
      today: {
        orders: todayOrders.length,
        revenue: round(todayRevenue)
      },
      statusCounts,
      revenue: {
        total: round(revenueTotal),
        averageOrderValue:
          orders.length > 0 ? round(revenueTotal / orders.length) : 0
      },
      bestSellers: computeBestSellers(orders)
    }
  });
}

/** GET /api/reports/daily - staff only */
export async function dailyReport(req, res) {
  const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 31);
  const orders = await getOrders();
  const today = startOfDay(new Date());

  const buckets = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    const key = dayKey(date);

    buckets.push({ key, label: formatDayLabel(date) });
  }

  const data = aggregate(orders, buckets, (date) => dayKey(date));

  res.json({
    success: true,
    data: {
      range: `Last ${days} days`,
      buckets: data,
      totals: summarise(data)
    }
  });
}

/** GET /api/reports/weekly - staff only */
export async function weeklyReport(req, res) {
  const weeks = Math.min(Math.max(Number(req.query.weeks) || 6, 1), 12);
  const orders = await getOrders();
  const currentWeekStart = startOfWeek(new Date());

  const buckets = [];

  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const start = addDays(currentWeekStart, -7 * offset);

    buckets.push({
      key: dayKey(start),
      label: `Week of ${formatDayLabel(start)}`
    });
  }

  const data = aggregate(orders, buckets, (date) => dayKey(startOfWeek(date)));

  res.json({
    success: true,
    data: {
      range: `Last ${weeks} weeks`,
      buckets: data,
      totals: summarise(data)
    }
  });
}

/** GET /api/reports/monthly - staff only */
export async function monthlyReport(req, res) {
  const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);
  const orders = await getOrders();
  const now = new Date();

  const buckets = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);

    buckets.push({ key: monthKey(date), label: formatMonthLabel(date) });
  }

  const data = aggregate(orders, buckets, (date) => monthKey(date));

  res.json({
    success: true,
    data: {
      range: `Last ${months} months`,
      buckets: data,
      totals: summarise(data),
      bestSellers: computeBestSellers(orders, 8)
    }
  });
}
