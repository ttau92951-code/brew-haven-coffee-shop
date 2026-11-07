import { Fragment, useMemo, useState } from 'react';

import { api } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import Loader, { EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';

const STATUSES = ['Pending', 'Preparing', 'Ready', 'Collected'];

export default function StaffOrdersPage() {
  const { token } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get('/orders', token), [token]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const orders = data?.data || [];

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = orders.filter((order) => {
      const matchesStatus = status === 'All' || order.status === status;
      const matchesTerm =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        (order.phone || '').toLowerCase().includes(term);

      return matchesStatus && matchesTerm;
    });

    const sorted = [...filtered];

    if (sort === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'oldest') sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === 'total-desc') sorted.sort((a, b) => b.total - a.total);
    if (sort === 'total-asc') sorted.sort((a, b) => a.total - b.total);

    return sorted;
  }, [orders, search, status, sort]);

  async function changeStatus(order, nextStatus) {
    if (nextStatus === order.status) return;

    setUpdating(order.id);
    setFeedback(null);

    try {
      await api.patch(`/orders/${order.id}/status`, { status: nextStatus }, token);
      setFeedback({ variant: 'success', message: `${order.orderNumber} marked as ${nextStatus}.` });
      await reload();
    } catch (updateError) {
      setFeedback({ variant: 'error', message: updateError.message });
    } finally {
      setUpdating(null);
    }
  }

  function advance(order) {
    const index = STATUSES.indexOf(order.status);
    const next = STATUSES[Math.min(index + 1, STATUSES.length - 1)];
    return changeStatus(order, next);
  }

  const counts = STATUSES.reduce((accumulator, value) => {
    accumulator[value] = orders.filter((order) => order.status === value).length;
    return accumulator;
  }, {});

  return (
    <>
      {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}

      <div className="kpi-grid">
        {STATUSES.map((value) => (
          <article className="kpi-card" key={value}>
            <span className="kpi-card__label">{value}</span>
            <span className="kpi-card__value">{counts[value]}</span>
            <StatusBadge status={value} />
          </article>
        ))}
      </div>

      {loading && <Loader label="Loading orders…" />}

      {error && (
        <div className="stack">
          <Alert variant="error">{error.message}</Alert>
          <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
            <Icon name="refresh" size={16} /> Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <section className="chart-card">
          <div className="data-toolbar">
            <div className="row row--wrap">
              <label className="search-box">
                <span className="sr-only">Search orders</span>
                <Icon name="search" size={17} />
                <input
                  type="search"
                  className="input"
                  placeholder="Search by order number, name or phone…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select className="select select--auto" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="All">All statuses</option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select className="select select--auto" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="total-desc">Highest total</option>
                <option value="total-asc">Lowest total</option>
              </select>
            </div>

            <div className="row">
              <span className="results-count">
                {visible.length} of {orders.length} orders
              </span>
              <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
                <Icon name="refresh" size={16} /> Refresh
              </button>
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No orders found"
              description="Orders placed by customers will appear here for processing."
            />
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
                    <th>Update status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((order) => {
                    const itemCount = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
                    const isOpen = expanded === order.id;

                    return (
                      <Fragment key={order.id}>
                        <tr>
                          <td>
                            <strong>{order.orderNumber}</strong>
                            <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                              {formatDateTime(order.createdAt)}
                            </div>
                          </td>
                          <td>
                            <strong>{order.customerName}</strong>
                            <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                              {order.phone}
                            </div>
                          </td>
                          <td>{itemCount}</td>
                          <td>
                            <strong>{formatCurrency(order.total)}</strong>
                          </td>
                          <td>
                            <StatusBadge status={order.status} />
                          </td>
                          <td>
                            <select
                              className="select"
                              style={{ minWidth: '140px' }}
                              value={order.status}
                              disabled={updating === order.id}
                              onChange={(event) => changeStatus(order, event.target.value)}
                            >
                              {STATUSES.map((value) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() => setExpanded(isOpen ? null : order.id)}
                              >
                                {isOpen ? 'Hide' : 'Details'}
                              </button>
                              {order.status !== 'Collected' && (
                                <button
                                  type="button"
                                  className="btn btn--accent btn--sm"
                                  disabled={updating === order.id}
                                  onClick={() => advance(order)}
                                >
                                  Advance
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr>
                            <td colSpan={7}>
                              <div className="muted-box">
                                <strong>Items ordered</strong>
                                <ul className="order-items" style={{ marginTop: 'var(--space-3)' }}>
                                  {(order.items || []).map((item, index) => (
                                    <li key={`${item.menuItemId || item.name}-${index}`}>
                                      <span>
                                        {item.quantity} × {item.name}
                                      </span>
                                      <span>{formatCurrency(item.subtotal ?? item.price * item.quantity)}</span>
                                    </li>
                                  ))}
                                </ul>

                                {order.notes && (
                                  <p style={{ marginTop: 'var(--space-3)' }}>Notes: {order.notes}</p>
                                )}

                                {order.email && (
                                  <p style={{ marginTop: 'var(--space-2)' }}>Email: {order.email}</p>
                                )}

                                <p style={{ marginTop: 'var(--space-2)' }}>
                                  Order ID: <code>{order.id}</code>
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
