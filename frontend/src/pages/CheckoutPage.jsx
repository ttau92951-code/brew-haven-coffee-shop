import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { EmptyState } from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/format.js';

const LAST_ORDER_KEY = 'brew-haven.lastOrder';

export default function CheckoutPage() {
  const { items, subtotal, count, clear, isEmpty } = useCart();
  const { user, token, isCustomer } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: isCustomer ? user.fullName || '' : '',
    phone: isCustomer ? user.phone || '' : '',
    email: isCustomer ? user.email || '' : '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  function validate() {
    const next = {};

    if (!form.customerName.trim()) {
      next.customerName = 'Please enter the name for the order.';
    }

    const phone = form.phone.trim();
    if (!phone) {
      next.phone = 'A contact number is required.';
    } else if (!/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
      next.phone = 'Please enter a valid contact number.';
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);

    try {
      const result = await api.post(
        '/orders',
        {
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          notes: form.notes.trim(),
          items: items.map((item) => ({ menuItemId: item.id, quantity: item.quantity }))
        },
        token
      );

      const order = result.data;

      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      } catch {
        /* storage unavailable - ignore */
      }

      clear();
      navigate(`/order/${order.id}`, { state: { order }, replace: true });
    } catch (error) {
      setServerError(error.message);
      setSubmitting(false);
    }
  }

  if (isEmpty) {
    return (
      <div className="page container">
        <EmptyState
          icon="🛒"
          title="Nothing to check out"
          description="Your cart is empty. Add some items from the menu to place an order."
          action={
            <Link to="/menu" className="btn btn--primary">
              Explore Our Menu
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Complete your order</h1>
          <p>Enter your details so we can prepare and hand over your order.</p>
        </div>
        <Link to="/cart" className="btn btn--outline btn--sm">
          Back to cart
        </Link>
      </div>

      <div className="checkout-layout">
        <div className="form-card">
          <h2>Your details</h2>

          <form onSubmit={handleSubmit} noValidate style={{ marginTop: 'var(--space-5)' }}>
            {serverError && <Alert variant="error">{serverError}</Alert>}

            {!isCustomer && (
              <Alert variant="info">
                Ordering as a guest. <Link to="/signup" className="link-muted">Create an account</Link> to track
                your orders and check out faster next time.
              </Alert>
            )}

            <div className="field">
              <label htmlFor="customerName">Full name *</label>
              <input
                id="customerName"
                className={`input${errors.customerName ? ' input--error' : ''}`}
                value={form.customerName}
                onChange={update('customerName')}
                placeholder="Jane Smith"
                autoComplete="name"
              />
              {errors.customerName && <span className="field-error">{errors.customerName}</span>}
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="phone">Contact number *</label>
                <input
                  id="phone"
                  className={`input${errors.phone ? ' input--error' : ''}`}
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+266 5800 0000"
                  autoComplete="tel"
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              <div className="field">
                <label htmlFor="email">Email (optional)</label>
                <input
                  id="email"
                  type="email"
                  className={`input${errors.email ? ' input--error' : ''}`}
                  value={form.email}
                  onChange={update('email')}
                  placeholder="jane@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="notes">Order notes (optional)</label>
              <textarea
                id="notes"
                className="textarea"
                value={form.notes}
                onChange={update('notes')}
                placeholder="Extra hot, oat milk, no sugar…"
              />
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
              {submitting ? 'Placing your order…' : `Place order · ${formatCurrency(subtotal)}`}
            </button>
          </form>
        </div>

        <aside className="order-summary">
          <h3>Your order</h3>

          <ul className="summary-list" style={{ marginTop: 'var(--space-4)' }}>
            {items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="summary-row">
            <span>Items</span>
            <strong>{count}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong className="price price--lg">{formatCurrency(subtotal)}</strong>
          </div>

          <div className="muted-box" style={{ marginTop: 'var(--space-5)' }}>
            <span className="row" style={{ gap: 'var(--space-2)' }}>
              <Icon name="clock" size={16} /> <strong>Ready for collection</strong>
            </span>
            <p style={{ marginTop: 'var(--space-2)' }}>
              We will notify you when your order status changes to Ready.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
