import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StaffLoginPage() {
  const { staffLogin, isStaff } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isStaff) {
    return <Navigate to="/staff" replace />;
  }

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setError('');
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Please enter your work email and password.');
      return;
    }

    setSubmitting(true);

    try {
      await staffLogin(form.email.trim(), form.password);
      navigate('/staff', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <h2>Staff sign in</h2>
        <p>
          This area is reserved for Brew Haven employees and administrators. Sign in with the work
          email and password your administrator assigned to you.
        </p>
        <ul>
          <li>
            <Icon name="check" size={18} /> Manage menu items and pricing
          </li>
          <li>
            <Icon name="check" size={18} /> Process customer orders
          </li>
          <li>
            <Icon name="check" size={18} /> View daily and monthly sales reports
          </li>
          <li>
            <Icon name="check" size={18} /> Administrators manage the employee team
          </li>
        </ul>
      </aside>

      <div className="auth-main">
        <div className="auth-card">
          <span className="eyebrow">Staff portal</span>
          <h1>Staff login</h1>
          <p>Enter your work email and password to access the management dashboard.</p>

          <form onSubmit={handleSubmit} noValidate>
            {error && <Alert variant="error">{error}</Alert>}

            <div className="field" style={{ marginTop: 'var(--space-4)' }}>
              <label htmlFor="staff-email">Work email</label>
              <input
                id="staff-email"
                type="email"
                className="input"
                value={form.email}
                onChange={update('email')}
                placeholder="you@brewhaven.co.ls"
                autoComplete="username"
              />
              <span className="field-hint">
                Use the work email your administrator assigned to you.
              </span>
            </div>

            <div className="field">
              <label htmlFor="staff-password">Password</label>
              <div className="input-group">
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn--ghost btn--sm input-group__action"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in to dashboard'}
            </button>
          </form>

          <p className="auth-switch">
            Not staff? <Link to="/">Return to the store</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
