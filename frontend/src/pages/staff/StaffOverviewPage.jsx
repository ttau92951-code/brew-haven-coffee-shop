import { Link } from 'react-router-dom';

import { api } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import Loader from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { formatCurrency, formatDateTime, formatTime } from '../../utils/format.js';

const STATUS_ORDER = ['Pending', 'Preparing', 'Ready', 'Collected'];

export default function StaffOverviewPage() {
  const { token } = useAuth();

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        api.get('/reports/overview', token),
        api.get('/reports/daily?days=7', token),
        api.get('/orders', token)
      ]).then(([overview, daily, orders]) => ({
        overview: overview.data,
        daily: daily.data,
        orders: orders.data
      })),
    [token]
  );

  if (loading) return <Loader label="Loading dashboard…" />;

  if (error) {
    return (
      <div className="stack">
        <Alert variant="error">{error.message}</Alert>
        <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
          <Icon name="refresh" size={16} /> Try again
        </button>
      </div>
    );
  }

  const { overview, daily, orders } = data;
  const buckets = daily?.buckets || [];
  const maxRevenue = Math.max(...buckets.map((bucket) => bucket.revenue), 1);
  const recentOrders = (orders || []).slice(0, 6);
  const bestSellers = overview?.bestSellers || [];
  const maxSold = Math.max(...bestSellers.map((item) => item.quantity), 1);

  const kpis = [
    { label: 'Total orders', value: overview.totals.orders, icon: '🧾', meta: `${formatCurrency(overview.revenue.total)} lifetime revenue` },
    { label: "Today's orders", value: overview.today.orders, icon: '📅', meta: `${formatCurrency(overview.today.revenue)} today` },
    { label: 'Average order value', value: formatCurrency(overview.revenue.averageOrderValue), icon: '📈', meta: 'Based on all orders' },
    { label: 'Menu items', value: overview.totals.menuItems, icon: '☕', meta: `${overview.totals.customers} registered customers` }
  ];

  return (
    <>
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <article className="kpi-card" key={kpi.label}>
            <div className="kpi-card__top">
              <span className="kpi-card__label">{kpi.label}</span>
              <span aria-hidden="true">{kpi.icon}</span>
            </div>
            <span className="kpi-card__value">{kpi.value}</span>
            <span className="kpi-card__meta">{kpi.meta}</span>
          </article>
        ))}
      </div>

      <div className="kpi-grid">
        {STATUS_ORDER.map((status) => (
          <article className="kpi-card" key={status}>
            <div className="kpi-card__top">
              <span className="kpi-card__label">{status} orders</span>
            </div>
            <span className="kpi-card__value">{overview.statusCounts[status] ?? 0}</span>
            <StatusBadge status={status} />
          </article>
        ))}
      </div>

      <div className="chart-grid">
        <section className="chart-card">
          <div className="row row--between">
            <h3>Revenue — last 7 days</h3>
            <strong className="price">{formatCurrency(daily?.totals.revenue || 0)}</strong>
          </div>

          <div className="bar-chart">
            {buckets.map((bucket) => (
              <div className="bar-col" key={bucket.key}>
                <span className="bar-col__value">{bucket.revenue > 0 ? formatCurrency(bucket.revenue).replace('.00', '') : ''}</span>
                <div
                  className="bar-col__bar"
                  style={{ height: `${Math.max((bucket.revenue / maxRevenue) * 100, 2)}%` }}
                  title={`${bucket.label}: ${formatCurrency(bucket.revenue)} from ${bucket.orders} orders`}
                />
                <span className="bar-col__label">{bucket.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-card">
          <h3>Best sellers</h3>

          {bestSellers.length === 0 ? (
            <p className="text-muted">No sales recorded yet.</p>
          ) : (
            <div className="rank-list">
              {bestSellers.map((item, index) => (
                <div className="rank-item" key={item.menuItemId || item.name}>
                  <span className="rank-item__index">{index + 1}</span>
                  <div className="rank-item__body">
                    <div className="row row--between">
                      <strong style={{ fontSize: '0.88rem' }}>{item.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {item.quantity} sold
                      </span>
                    </div>
                    <div className="rank-item__bar">
                      <span style={{ width: `${(item.quantity / maxSold) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="chart-card">
        <div className="row row--between" style={{ marginBottom: 'var(--space-4)' }}>
          <h3>Recent orders</h3>
          <Link to="/staff/orders" className="btn btn--outline btn--sm">
            Manage orders <Icon name="arrowRight" size={16} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-muted">No orders have been placed yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {formatDateTime(order.createdAt)}
                      </div>
                    </td>
                    <td>{order.customerName}</td>
                    <td>{(order.items || []).reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{formatTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
