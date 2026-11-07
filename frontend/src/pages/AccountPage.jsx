import { useState } from 'react';

import { api } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import Loader, { EmptyState } from '../components/Loader.jsx';
import OrderCard from '../components/OrderCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { Link } from 'react-router-dom';

export default function AccountPage() {
  const { user, token, updateUser, logout } = useAuth();
  const [tab, setTab] = useState('profile');

  return (
    <div className="page container">
      <header className="account-header">
        <span className="account-header__avatar" aria-hidden="true">
          {(user?.fullName || 'G').charAt(0).toUpperCase()}
        </span>
        <div className="grow">
          <span className="eyebrow" style={{ color: 'var(--beige)' }}>
            My account
          </span>
          <h1>{user?.fullName}</h1>
          <p>
            {user?.email} · {user?.phone}
          </p>
        </div>
        <button type="button" className="btn btn--outline" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.5)' }} onClick={logout}>
          <Icon name="logout" size={16} /> Log out
        </button>
      </header>

      <div className="dash-tabs">
        <button type="button" className={`tab${tab === 'profile' ? ' is-active' : ''}`} onClick={() => setTab('profile')}>
          Profile details
        </button>
        <button type="button" className={`tab${tab === 'orders' ? ' is-active' : ''}`} onClick={() => setTab('orders')}>
          My orders
        </button>
      </div>

      {tab === 'profile' ? (
        <ProfilePanel user={user} token={token} updateUser={updateUser} />
      ) : (
        <OrdersPanel token={token} />
      )}
    </div>
  );
}

function ProfilePanel({ user, token, updateUser }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function updatePassword(field) {
    return (event) => setPasswords((current) => ({ ...current, [field]: event.target.value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileFeedback(null);

    if (!form.fullName.trim()) {
      setProfileFeedback({ variant: 'error', message: 'Full name cannot be empty.' });
      return;
    }

    setSavingProfile(true);

    try {
      const result = await api.put(
        '/customers/me',
        { fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() },
        token
      );

      updateUser(result.data);
      setProfileFeedback({ variant: 'success', message: result.message || 'Profile updated.' });
    } catch (error) {
      setProfileFeedback({ variant: 'error', message: error.message });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setPasswordFeedback(null);

    if (passwords.newPassword.length < 8) {
      setPasswordFeedback({ variant: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordFeedback({ variant: 'error', message: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);

    try {
      await api.put(
        '/customers/me',
        { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
        token
      );

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordFeedback({ variant: 'success', message: 'Your password has been updated.' });
    } catch (error) {
      setPasswordFeedback({ variant: 'error', message: error.message });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="checkout-layout">
      <div className="form-card">
        <h2>Profile details</h2>
        <p style={{ marginBottom: 'var(--space-5)' }}>Keep your contact information up to date for faster checkout.</p>

        <form onSubmit={saveProfile} noValidate>
          {profileFeedback && <Alert variant={profileFeedback.variant}>{profileFeedback.message}</Alert>}

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
            <label htmlFor="profile-name">Full name</label>
            <input id="profile-name" className="input" value={form.fullName} onChange={update('fullName')} />
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="profile-email">Email address</label>
              <input id="profile-email" type="email" className="input" value={form.email} onChange={update('email')} />
            </div>

            <div className="field">
              <label htmlFor="profile-phone">Phone number</label>
              <input id="profile-phone" className="input" value={form.phone} onChange={update('phone')} />
            </div>
          </div>

          <button type="submit" className="btn btn--primary" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--space-6) 0' }} />

        <h3 style={{ marginBottom: 'var(--space-2)' }}>Change password</h3>
        <p style={{ marginBottom: 'var(--space-4)' }}>Choose a strong password you have not used before.</p>

        <form onSubmit={savePassword} noValidate>
          {passwordFeedback && <Alert variant={passwordFeedback.variant}>{passwordFeedback.message}</Alert>}

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
            <label htmlFor="current-password">Current password</label>
            <input
              id="current-password"
              type="password"
              className="input"
              value={passwords.currentPassword}
              onChange={updatePassword('currentPassword')}
              autoComplete="current-password"
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                className="input"
                value={passwords.newPassword}
                onChange={updatePassword('newPassword')}
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label htmlFor="confirm-new-password">Confirm new password</label>
              <input
                id="confirm-new-password"
                type="password"
                className="input"
                value={passwords.confirmPassword}
                onChange={updatePassword('confirmPassword')}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn--outline" disabled={savingPassword}>
            {savingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>

      <aside className="summary-card">
        <h3>Account overview</h3>
        <div className="summary-row">
          <span>Customer since</span>
          <strong>{formatDate(user?.createdAt)}</strong>
        </div>
        <div className="summary-row">
          <span>Account type</span>
          <strong style={{ textTransform: 'capitalize' }}>Customer</strong>
        </div>
        <div className="muted-box" style={{ marginTop: 'var(--space-4)' }}>
          <p>Your password is stored using bcrypt hashing — we never keep it in plain text.</p>
        </div>
        <Link to="/menu" className="btn btn--accent btn--block">
          Start a new order
        </Link>
      </aside>
    </div>
  );
}

function OrdersPanel({ token }) {
  const { data, loading, error, reload } = useAsync(() => api.get('/customers/me/orders', token), []);
  const orders = data?.data || [];

  const spent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  if (loading) return <Loader label="Loading your orders…" />;

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

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="🧾"
        title="No orders yet"
        description="When you place an order it will appear here with live status updates."
        action={
          <Link to="/menu" className="btn btn--primary">
            Browse the menu
          </Link>
        }
      />
    );
  }

  return (
    <div className="stack">
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Total orders</span>
          <span className="stat-card__value">{orders.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Total spent</span>
          <span className="stat-card__value">{formatCurrency(spent)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">In progress</span>
          <span className="stat-card__value">
            {orders.filter((order) => order.status !== 'Collected').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Collected</span>
          <span className="stat-card__value">
            {orders.filter((order) => order.status === 'Collected').length}
          </span>
        </div>
      </div>

      <div className="row row--between">
        <h3>Order history</h3>
        <button type="button" className="btn btn--outline btn--sm" onClick={reload}>
          <Icon name="refresh" size={16} /> Refresh
        </button>
      </div>

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
