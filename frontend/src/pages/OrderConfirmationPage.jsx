import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import Loader from '../components/Loader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDateTime } from '../utils/format.js';

const LAST_ORDER_KEY = 'brew-haven.lastOrder';

function readLastOrder() {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const { token } = useAuth();

  const [order, setOrder] = useState(location.state?.order || readLastOrder());
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) return;

    let cancelled = false;

    async function load() {
      try {
        const result = await api.get(`/orders/${id}`, token);
        if (!cancelled) setOrder(result.data);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, token, order]);

  if (loading) {
    return (
      <div className="page container">
        <Loader label="Loading your order…" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page container">
        <div className="confirmation">
          <Alert variant="error">
            {error || 'We could not find that order. Please check the order number and try again.'}
          </Alert>
          <div className="row" style={{ marginTop: 'var(--space-4)' }}>
            <Link to="/menu" className="btn btn--primary">
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="confirmation">
        <div className="confirm-hero">
          <div className="confirm-tick" aria-hidden="true">
            <Icon name="check" size={30} />
          </div>
          <h1>Thank you, {order.customerName}!</h1>
          <p>Your order has been received and our team is getting started.</p>
          <div className="order-number">{order.orderNumber}</div>
        </div>

        <div className="confirm-body">
          <div className="row row--between" style={{ marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
            <div>
              <span className="eyebrow">Order status</span>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div className="text-center">
              <span className="eyebrow">Placed</span>
              <p style={{ marginTop: 'var(--space-2)' }}>{formatDateTime(order.createdAt)}</p>
            </div>
          </div>

          <h3 style={{ marginBottom: 'var(--space-3)' }}>Order summary</h3>

          <ul className="summary-list">
            {(order.items || []).map((item, index) => (
              <li key={`${item.menuItemId || item.name}-${index}`}>
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatCurrency(item.subtotal ?? item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="summary-total">
            <span>Total paid on collection</span>
            <strong className="price price--lg">{formatCurrency(order.total)}</strong>
          </div>

          <div className="muted-box" style={{ marginTop: 'var(--space-5)' }}>
            <strong>Collection details</strong>
            <p style={{ marginTop: 'var(--space-2)' }}>
              {order.customerName} · {order.phone}
            </p>
            {order.notes && <p style={{ marginTop: 'var(--space-2)' }}>Notes: {order.notes}</p>}
            <p style={{ marginTop: 'var(--space-3)' }}>
              Keep your order number <strong>{order.orderNumber}</strong> handy when you collect.
            </p>
          </div>

          <div className="row" style={{ marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
            <Link to="/menu" className="btn btn--primary">
              Order something else
            </Link>
            <Link to="/orders" className="btn btn--outline">
              Track my orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
