import { useMemo, useState } from 'react';

import { api } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import Loader, { EmptyState } from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format.js';

export default function StaffCustomersPage() {
  const { token } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get('/customers', token), [token]);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const customers = data?.data || [];

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        (customer.phone || '').toLowerCase().includes(term)
    );
  }, [customers, search]);

  async function openHistory(customer) {
    setSelected(customer);
    setHistory(null);
    setHistoryLoading(true);

    try {
      const result = await api.get(`/customers/${customer.id}/orders`, token);
      setHistory(result.data);
    } catch (historyError) {
      setFeedback({ variant: 'error', message: historyError.message });
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistory() {
    setSelected(null);
    setHistory(null);
  }

  async function removeCustomer(customer) {
    const confirmed = window.confirm(
      `Remove ${customer.fullName}'s account? Their past orders will remain in the system.`
    );
    if (!confirmed) return;

    try {
      await api.del(`/customers/${customer.id}`, token);
      setFeedback({ variant: 'success', message: `${customer.fullName}'s account was removed.` });
      await reload();
    } catch (deleteError) {
      setFeedback({ variant: 'error', message: deleteError.message });
    }
  }

  return (
    <>
      {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}

      {loading && <Loader label="Loading customers…" />}

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
            <label className="search-box">
              <span className="sr-only">Search customers</span>
              <Icon name="search" size={17} />
              <input
                type="search"
                className="input"
                placeholder="Search by name, email or phone…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <div className="row">
              <span className="results-count">
                {visible.length} of {customers.length} customers
              </span>
              <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
                <Icon name="refresh" size={16} /> Refresh
              </button>
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No customers found"
              description="Registered customers will appear here."
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Orders</th>
                    <th>Total spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="row">
                          <span className="account__avatar" aria-hidden="true">
                            {customer.fullName.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong>{customer.fullName}</strong>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{customer.phone}</td>
                      <td>{formatDate(customer.createdAt)}</td>
                      <td>{customer.orderCount}</td>
                      <td>
                        <strong>{formatCurrency(customer.totalSpent)}</strong>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="btn btn--outline btn--sm" onClick={() => openHistory(customer)}>
                            Order history
                          </button>
                          <button type="button" className="btn btn--danger btn--sm" onClick={() => removeCustomer(customer)}>
                            <Icon name="trash" size={15} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <Modal
        open={Boolean(selected)}
        title={selected ? `${selected.fullName} — order history` : 'Order history'}
        onClose={closeHistory}
        size="lg"
      >
        {selected && (
          <>
            <div className="muted-box" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="row row--between">
                <span className="text-muted">Email</span>
                <strong>{selected.email}</strong>
              </div>
              <div className="row row--between" style={{ marginTop: 'var(--space-2)' }}>
                <span className="text-muted">Phone</span>
                <strong>{selected.phone}</strong>
              </div>
              <div className="row row--between" style={{ marginTop: 'var(--space-2)' }}>
                <span className="text-muted">Customer since</span>
                <strong>{formatDate(selected.createdAt)}</strong>
              </div>
            </div>

            {historyLoading && <Loader label="Loading order history…" />}

            {!historyLoading && history && history.length === 0 && (
              <p className="text-muted">This customer has not placed any orders yet.</p>
            )}

            {!historyLoading && history && history.length > 0 && (
              <div className="stack">
                {history.map((order) => (
                  <div className="order-card" key={order.id}>
                    <div className="order-card__head">
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                          {formatDateTime(order.createdAt)}
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="order-card__body">
                      <ul className="order-items">
                        {(order.items || []).map((item, index) => (
                          <li key={`${item.menuItemId || item.name}-${index}`}>
                            <span>
                              {item.quantity} × {item.name}
                            </span>
                            <span>{formatCurrency(item.subtotal ?? item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="row row--between">
                        <span className="text-muted">Total</span>
                        <strong className="price">{formatCurrency(order.total)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
