import { useMemo, useState } from 'react';

import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { formatDateTime } from '../utils/format.js';

const TYPES = [
  { value: 'Review', label: 'Review', hint: 'Rate your experience and tell us how we did.' },
  { value: 'Compliment', label: 'Compliment', hint: 'Share something our team did well.' },
  { value: 'Complaint', label: 'Complaint', hint: 'Tell us what went wrong so we can fix it.' }
];

const STATUS_LABELS = {
  New: { label: 'Sent', variant: 'pending' },
  Read: { label: 'Read by staff', variant: 'preparing' },
  Resolved: { label: 'Resolved', variant: 'ready' }
};

const EMPTY_FORM = {
  type: 'Review',
  rating: 0,
  subject: '',
  message: '',
  orderNumber: ''
};

function StarPicker({ value, onChange, disabled }) {
  return (
    <div className="star-input" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-input__star${star <= value ? ' is-active' : ''}`}
          onClick={() => onChange(star)}
          disabled={disabled}
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
        >
          ★
        </button>
      ))}
      <span className="star-input__value">{value > 0 ? `${value} / 5` : 'Not rated'}</span>
    </div>
  );
}

export default function ReviewsPage() {
  const { token, user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get('/feedback/me', token), [token]);
  const orders = useAsync(() => api.get('/customers/me/orders', token), [token]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [errors, setErrors] = useState({});

  const mine = data?.data || [];
  const myOrders = useMemo(() => orders.data?.data || [], [orders.data]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const found = {};

    if (form.type === 'Review' && (!form.rating || form.rating < 1)) {
      found.rating = 'Please choose a star rating for your review.';
    }

    if (!form.message.trim()) {
      found.message = 'Please write a short message.';
    } else if (form.message.trim().length > 1000) {
      found.message = 'Your message must be 1000 characters or fewer.';
    }

    if (form.subject.trim().length > 120) {
      found.subject = 'The subject must be 120 characters or fewer.';
    }

    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      await api.post(
        '/feedback',
        {
          type: form.type,
          rating: form.rating > 0 ? form.rating : undefined,
          subject: form.subject,
          message: form.message,
          orderNumber: form.orderNumber
        },
        token
      );

      setForm(EMPTY_FORM);
      setFeedback({
        variant: 'success',
        message: 'Thank you! Your message has been sent to the Brew Haven team.'
      });
      await reload();
    } catch (submitError) {
      setFeedback({ variant: 'error', message: submitError.message });
    } finally {
      setSubmitting(false);
    }
  }

  const activeType = TYPES.find((entry) => entry.value === form.type) || TYPES[0];

  return (
    <div className="page container">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Reviews &amp; feedback</span>
          <h1>Tell us about your visit</h1>
          <p>
            Send a review, a compliment or a complaint. Everything you write is delivered
            straight to the Brew Haven team, and their reply will appear here.
          </p>
        </div>
      </div>

      <div className="reviews-layout">
        <section className="form-card">
          <h2>Write a message</h2>
          <p className="text-muted" style={{ marginBottom: 'var(--space-5)' }}>
            Signed in as <strong>{user?.fullName}</strong>
          </p>

          {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}

          <form className="stack" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="feedback-type">What would you like to share?</label>
              <select
                id="feedback-type"
                className="select"
                value={form.type}
                onChange={(event) => update('type', event.target.value)}
              >
                {TYPES.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
              <span className="field-hint">{activeType.hint}</span>
            </div>

            <div className="field">
              <label>Rating{form.type === 'Review' ? '' : ' (optional)'}</label>
              <StarPicker value={form.rating} onChange={(value) => update('rating', value)} />
              {errors.rating && <span className="field-error">{errors.rating}</span>}
            </div>

            <div className="field">
              <label htmlFor="feedback-subject">Subject (optional)</label>
              <input
                id="feedback-subject"
                type="text"
                className="input"
                placeholder="e.g. Perfect flat white"
                value={form.subject}
                onChange={(event) => update('subject', event.target.value)}
              />
              {errors.subject && <span className="field-error">{errors.subject}</span>}
            </div>

            <div className="field">
              <label htmlFor="feedback-message">Your message</label>
              <textarea
                id="feedback-message"
                className="textarea"
                rows="5"
                placeholder="Tell us what you think…"
                value={form.message}
                onChange={(event) => update('message', event.target.value)}
              />
              {errors.message && <span className="field-error">{errors.message}</span>}
            </div>

            {myOrders.length > 0 && (
              <div className="field">
                <label htmlFor="feedback-order">Related order (optional)</label>
                <select
                  id="feedback-order"
                  className="select"
                  value={form.orderNumber}
                  onChange={(event) => update('orderNumber', event.target.value)}
                >
                  <option value="">Not linked to an order</option>
                  {myOrders.map((order) => (
                    <option key={order.id} value={order.orderNumber}>
                      {order.orderNumber} — {order.items?.length || 0} item(s)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send to Brew Haven staff'}
            </button>
          </form>
        </section>

        <section>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>Your messages</h2>

          {loading && <Loader label="Loading your messages…" />}

          {error && <Alert variant="error">{error.message}</Alert>}

          {!loading && !error && mine.length === 0 && (
            <EmptyState
              icon="💬"
              title="You have not sent any messages yet"
              description="Use the form to send your first review, compliment or complaint."
            />
          )}

          {mine.length > 0 && (
            <div className="stack">
              {mine.map((record) => {
                const status = STATUS_LABELS[record.status] || STATUS_LABELS.New;

                return (
                  <article className="feedback-card" key={record.id}>
                    <div className="feedback-card__head">
                      <div className="row row--wrap">
                        <span className={`badge badge--${record.type.toLowerCase()}`}>
                          {record.type}
                        </span>
                        {record.rating > 0 && (
                          <span className="rating-stars" aria-label={`${record.rating} out of 5`}>
                            {'★'.repeat(record.rating)}
                            <span className="rating-stars__empty">
                              {'★'.repeat(5 - record.rating)}
                            </span>
                          </span>
                        )}
                        <span className={`badge badge--${status.variant}`}>{status.label}</span>
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.76rem' }}>
                        {formatDateTime(record.createdAt)}
                      </span>
                    </div>

                    {record.subject && <h3>{record.subject}</h3>}

                    <p>{record.message}</p>

                    {record.orderNumber && (
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                        Order {record.orderNumber}
                      </p>
                    )}

                    {record.reply && (
                      <div className="feedback-reply">
                        <strong>
                          <Icon name="chat" size={15} /> Brew Haven replied
                        </strong>
                        <p>{record.reply.message}</p>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {record.reply.staffName} · {formatDateTime(record.reply.at)}
                        </span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
