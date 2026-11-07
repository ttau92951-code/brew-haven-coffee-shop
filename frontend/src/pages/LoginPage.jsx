import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, isAuthenticated, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={isStaff ? '/staff' : from || '/account'} replace />;
  }

  function update(field) {
    return (event) => {
      const value = field === 'remember' ? event.target.checked : event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
      setError('');
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email address and password.');
      return;
    }

    setSubmitting(true);

    try {
      await login(form.email.trim(), form.password, form.remember);
      navigate(from || '/account', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <h2>Welcome back to Brew Haven</h2>
        <p>Sign in to track your orders, reorder your favourites and check out faster.</p>
        <ul>
          <li>
            <Icon name="check" size={18} /> Track every order in real time
          </li>
          <li>
            <Icon name="check" size={18} /> Save your details for quick checkout
          </li>
          <li>
            <Icon name="check" size={18} /> View your complete order history
          </li>
        </ul>
      </aside>

      <div className="auth-main">
        <div className="auth-card">
          <span className="eyebrow">Customer login</span>
          <h1>Sign in</h1>
          <p>Enter your email and password to access your account.</p>

          <form onSubmit={handleSubmit} noValidate>
            {error && <Alert variant="error">{error}</Alert>}
            {notice && <Alert variant="info">{notice}</Alert>}

            <div className="field" style={{ marginTop: 'var(--space-4)' }}>
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className="input"
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="input-group">
                <input
                  id="login-password"
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

            <div className="form-row-between">
              <label className="checkbox">
                <input type="checkbox" checked={form.remember} onChange={update('remember')} />
                Remember me
              </label>

              <button
                type="button"
                className="link-muted"
                onClick={() => setNotice('Password resets are handled in store — please speak to a member of staff.')}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            New to Brew Haven? <Link to="/signup">Create an account</Link>
          </p>
          <p className="auth-switch">
            Are you staff? <Link to="/staff/login">Staff login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
