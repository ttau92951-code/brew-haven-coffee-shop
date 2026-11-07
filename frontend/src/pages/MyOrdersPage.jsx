import { Link } from 'react-router-dom';

import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';
import OrderCard from '../components/OrderCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { formatCurrency } from '../utils/format.js';

export default function MyOrdersPage() {
  const { token } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get('/customers/me/orders', token), []);
  const orders = data?.data || [];

  const active = orders.filter((order) => order.status !== 'Collected');
  const past = orders.filter((order) => order.status === 'Collected');
  const spent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  return (
    <div className="page container">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">My orders</span>
          <h1>Track your orders</h1>
          <p>Follow the progress of every order from pending to collected.</p>
        </div>
        <button type="button" className="btn btn--outline btn--sm" onClick={reload} disabled={loading}>
          <Icon name="refresh" size={16} /> Refresh
        </button>
      </div>

      {loading && <Loader label="Loading your orders…" />}

      {error && (
        <div className="stack">
          <Alert variant="error">{error.message}</Alert>
          <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon="🧾"
          title="You have no orders yet"
          description="Place your first order and it will show up here with live status tracking."
          action={
            <Link to="/menu" className="btn btn--primary">
              Explore Our Menu
            </Link>
          }
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card">
              <span className="stat-card__label">Orders placed</span>
              <span className="stat-card__value">{orders.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Total spent</span>
              <span className="stat-card__value">{formatCurrency(spent)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">In progress</span>
              <span className="stat-card__value">{active.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Completed</span>
              <span className="stat-card__value">{past.length}</span>
            </div>
          </div>

          {active.length > 0 && (
            <section style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>In progress</h2>
              {active.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>Past orders</h2>
              {past.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
