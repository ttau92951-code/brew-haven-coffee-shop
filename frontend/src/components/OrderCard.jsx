import StatusBadge from './StatusBadge.jsx';
import { formatCurrency, formatDateTime } from '../utils/format.js';

const FLOW = ['Pending', 'Preparing', 'Ready', 'Collected'];

export default function OrderCard({ order, children }) {
  const currentIndex = Math.max(FLOW.indexOf(order.status), 0);

  return (
    <article className="order-card">
      <header className="order-card__head">
        <div>
          <strong>{order.orderNumber}</strong>
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
            {formatDateTime(order.createdAt)}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </header>

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

        {order.notes && <p className="text-muted">Notes: {order.notes}</p>}

        <div className="timeline">
          {FLOW.map((step, index) => (
            <div
              key={step}
              className={`timeline__step${index < currentIndex ? ' is-done' : ''}${
                index === currentIndex ? ' is-current' : ''
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="row row--between" style={{ marginTop: 'var(--space-3)' }}>
          <span className="text-muted">Order total</span>
          <strong className="price">{formatCurrency(order.total)}</strong>
        </div>

        {children}
      </div>
    </article>
  );
}
