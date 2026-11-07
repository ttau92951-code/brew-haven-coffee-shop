import { Link } from 'react-router-dom';

import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';
import { formatDateTime } from '../utils/format.js';

const TYPE_ICONS = {
  order_update: 'receipt',
  feedback_reply: 'chat',
  system: 'bell'
};

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, reload, markRead, markAllRead } =
    useNotifications();

  return (
    <div className="page container">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Your alerts</span>
          <h1>Notifications</h1>
          <p>
            We will let you know the moment an order is ready for collection and when
            staff reply to your messages.
          </p>
        </div>

        <div className="row row--wrap">
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={reload}
            disabled={loading}
          >
            <Icon name="refresh" size={16} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <Icon name="check" size={16} /> Mark all as read
          </button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && notifications.length === 0 && <Loader label="Loading your notifications…" />}

      {!loading && notifications.length === 0 && (
        <EmptyState
          icon="🔔"
          title="No notifications yet"
          description="Place an order and we will alert you as it moves from pending to ready for collection."
          action={
            <Link to="/menu" className="btn btn--primary">
              Explore Our Menu
            </Link>
          }
        />
      )}

      {notifications.length > 0 && (
        <ul className="notif-list">
          {notifications.map((item) => {
            const body = (
              <>
                <span className="notif-item__icon" aria-hidden="true">
                  <Icon name={TYPE_ICONS[item.type] || 'bell'} size={18} />
                </span>

                <div className="notif-item__body">
                  <div className="notif-item__top">
                    <strong>{item.title}</strong>
                    <span className="notif-item__time">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p>{item.message}</p>
                  {item.orderNumber && (
                    <span className="notif-item__meta">Order {item.orderNumber}</span>
                  )}
                </div>

                {!item.read && <span className="notif-item__dot" aria-label="Unread" />}
              </>
            );

            const className = `notif-item${item.read ? '' : ' is-unread'}`;

            return (
              <li key={item.id}>
                {item.link ? (
                  <Link to={item.link} className={className} onClick={() => markRead(item.id)}>
                    {body}
                  </Link>
                ) : (
                  <button type="button" className={className} onClick={() => markRead(item.id)}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <section className="cta-banner" style={{ marginTop: 'var(--space-6)' }}>
        <div>
          <h2>How was your last visit?</h2>
          <p>
            Tell us what you loved or what we could do better — every review, compliment
            and complaint reaches our team directly.
          </p>
        </div>
        <Link to="/reviews" className="btn btn--accent">
          Write a review <Icon name="arrowRight" size={16} />
        </Link>
      </section>
    </div>
  );
}
