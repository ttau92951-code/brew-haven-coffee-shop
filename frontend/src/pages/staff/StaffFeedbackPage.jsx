import { useMemo, useState } from 'react';

import { api } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import Loader, { EmptyState } from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { formatDateTime } from '../../utils/format.js';

const TYPES = ['All', 'Review', 'Compliment', 'Complaint'];
const STATUSES = ['All', 'New', 'Read', 'Resolved'];

const STATUS_STYLES = {
  New: 'pending',
  Read: 'preparing',
  Resolved: 'ready'
};

export default function StaffFeedbackPage() {
  const { token } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get('/feedback', token), [token]);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const records = data?.data || [];
  const summary = data?.summary || {};

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesType = type === 'All' || record.type === type;
      const matchesStatus = status === 'All' || record.status === status;
      const matchesTerm =
        !term ||
        [record.customerName, record.subject, record.message, record.orderNumber]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return matchesType && matchesStatus && matchesTerm;
    });
  }, [records, search, type, status]);

  function openRecord(record) {
    setSelected(record);
    setReply(record.reply?.message || '');
    setFeedback(null);
  }

  function closeRecord() {
    setSelected(null);
    setReply('');
  }

  async function changeStatus(record, nextStatus) {
    if (nextStatus === record.status) return;

    setBusy(true);
    setFeedback(null);

    try {
      const result = await api.patch(`/feedback/${record.id}`, { status: nextStatus }, token);
      setFeedback({ variant: 'success', message: `Marked as ${nextStatus}.` });
      setSelected((current) => (current?.id === record.id ? result.data : current));
      await reload();
    } catch (updateError) {
      setFeedback({ variant: 'error', message: updateError.message });
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(event) {
    event.preventDefault();

    if (!reply.trim()) {
      setFeedback({ variant: 'error', message: 'Please write a reply before sending.' });
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const result = await api.post(`/feedback/${selected.id}/reply`, { message: reply }, token);
      setFeedback({
        variant: 'success',
        message: 'Reply sent — the customer has been notified.'
      });
      setSelected(result.data);
      setReply(result.data.reply?.message || '');
      await reload();
    } catch (replyError) {
      setFeedback({ variant: 'error', message: replyError.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}

      <div className="kpi-grid">
        <article className="kpi-card">
          <span className="kpi-card__label">All messages</span>
          <span className="kpi-card__value">{summary.total ?? 0}</span>
          <span className="kpi-card__meta">Reviews, compliments and complaints</span>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Awaiting reply</span>
          <span className="kpi-card__value">{summary.new ?? 0}</span>
          <span className="kpi-card__meta">New messages from customers</span>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Average rating</span>
          <span className="kpi-card__value">
            {summary.averageRating ? `${summary.averageRating} / 5` : '—'}
          </span>
          <span className="kpi-card__meta">Based on {summary.reviews ?? 0} review(s)</span>
        </article>
        <article className="kpi-card">
          <span className="kpi-card__label">Resolved</span>
          <span className="kpi-card__value">{summary.resolved ?? 0}</span>
          <span className="kpi-card__meta">
            {summary.complaints ?? 0} complaint(s) received
          </span>
        </article>
      </div>

      {loading && <Loader label="Loading customer messages…" />}

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
              <span className="sr-only">Search messages</span>
              <Icon name="search" size={17} />
              <input
                type="search"
                className="input"
                placeholder="Search by customer, subject or order…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <div className="row row--wrap">
              <label className="field-inline">
                <span className="sr-only">Filter by type</span>
                <select
                  className="select select--sm"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  {TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value === 'All' ? 'All types' : value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-inline">
                <span className="sr-only">Filter by status</span>
                <select
                  className="select select--sm"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value === 'All' ? 'All statuses' : value}
                    </option>
                  ))}
                </select>
              </label>

              <span className="results-count">
                {visible.length} of {records.length} message(s)
              </span>

              <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
                <Icon name="refresh" size={16} /> Refresh
              </button>
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="💬"
              title="No customer messages found"
              description="Reviews, compliments and complaints left by customers will appear here."
            />
          ) : (
            <ul className="feedback-list">
              {visible.map((record) => (
                <li key={record.id}>
                  <article className="feedback-card">
                    <div className="feedback-card__head">
                      <div className="row row--wrap">
                        <span className="account__avatar" aria-hidden="true">
                          {record.customerName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{record.customerName}</strong>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {formatDateTime(record.createdAt)}
                          </div>
                        </div>
                      </div>

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
                        <span className={`badge badge--${STATUS_STYLES[record.status] || 'neutral'}`}>
                          {record.status}
                        </span>
                      </div>
                    </div>

                    {record.subject && <h3>{record.subject}</h3>}
                    <p className="feedback-card__message">{record.message}</p>

                    <div className="feedback-card__foot">
                      <div className="row row--wrap">
                        {record.orderNumber && (
                          <span className="notif-item__meta">Order {record.orderNumber}</span>
                        )}
                        {record.repliedAt && (
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                            Replied {formatDateTime(record.repliedAt)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => openRecord(record)}
                      >
                        {record.reply ? 'View reply' : 'Open & reply'}
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Modal
        open={Boolean(selected)}
        title={selected ? `${selected.type} from ${selected.customerName}` : 'Customer message'}
        onClose={closeRecord}
        size="lg"
      >
        {selected && (
          <>
            <div className="muted-box" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="row row--wrap" style={{ marginBottom: 'var(--space-3)' }}>
                <span className={`badge badge--${selected.type.toLowerCase()}`}>
                  {selected.type}
                </span>
                {selected.rating > 0 && (
                  <span className="rating-stars" aria-label={`${selected.rating} out of 5`}>
                    {'★'.repeat(selected.rating)}
                    <span className="rating-stars__empty">{'★'.repeat(5 - selected.rating)}</span>
                  </span>
                )}
                <span className={`badge badge--${STATUS_STYLES[selected.status] || 'neutral'}`}>
                  {selected.status}
                </span>
              </div>

              <div className="row row--between">
                <span className="text-muted">Customer</span>
                <strong>{selected.customerName}</strong>
              </div>
              {selected.email && (
                <div className="row row--between" style={{ marginTop: 'var(--space-2)' }}>
                  <span className="text-muted">Email</span>
                  <strong>{selected.email}</strong>
                </div>
              )}
              {selected.orderNumber && (
                <div className="row row--between" style={{ marginTop: 'var(--space-2)' }}>
                  <span className="text-muted">Order</span>
                  <strong>{selected.orderNumber}</strong>
                </div>
              )}
              <div className="row row--between" style={{ marginTop: 'var(--space-2)' }}>
                <span className="text-muted">Received</span>
                <strong>{formatDateTime(selected.createdAt)}</strong>
              </div>
            </div>

            {selected.subject && <h3 style={{ marginBottom: 'var(--space-2)' }}>{selected.subject}</h3>}
            <p style={{ whiteSpace: 'pre-line', marginBottom: 'var(--space-5)' }}>
              {selected.message}
            </p>

            <div className="field">
              <span className="field-label">Update status</span>
              <div className="row row--wrap">
                {STATUSES.filter((value) => value !== 'All').map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`btn btn--sm ${
                      selected.status === value ? 'btn--primary' : 'btn--outline'
                    }`}
                    onClick={() => changeStatus(selected, value)}
                    disabled={busy}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <form className="field" onSubmit={sendReply}>
              <label htmlFor="feedback-reply">
                {selected.reply ? 'Update your reply' : 'Reply to the customer'}
              </label>
              <textarea
                id="feedback-reply"
                className="textarea"
                rows="4"
                placeholder="Thank you for your feedback…"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
              />
              <span className="field-hint">
                The customer receives this reply as a notification in their account.
              </span>

              <div className="row" style={{ marginTop: 'var(--space-3)' }}>
                <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
                  <Icon name="chat" size={16} /> {busy ? 'Sending…' : 'Send reply'}
                </button>
                {selected.repliedAt && (
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                    Last replied {formatDateTime(selected.repliedAt)}
                  </span>
                )}
              </div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}
