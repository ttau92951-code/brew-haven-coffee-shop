import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const INITIAL = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
};

export default function SignUpPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setServerError('');
    };
  }

  function validate() {
    const next = {};

    if (!form.fullName.trim()) next.fullName = 'Please enter your full name.';

    if (!form.email.trim()) {
      next.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }

    if (!form.phone.trim()) {
      next.phone = 'Please enter your phone number.';
    } else if (!/^[+]?[\d\s()-]{7,20}$/.test(form.phone.trim())) {
      next.phone = 'Please enter a valid phone number.';
    }

    if (!form.password) {
      next.password = 'Please choose a password.';
    } else if (form.password.length < 8) {
      next.password = 'Password must be at least 8 characters long.';
    }

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    setSuccess('');

    if (!validate()) return;

    setSubmitting(true);

    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword
      });

      setSuccess('Your account has been created. Taking you to your dashboard…');
      setTimeout(() => navigate('/account', { replace: true }), 900);
    } catch (error) {
      setServerError(error.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <h2>Join the Brew Haven family</h2>
        <p>Create a free account and enjoy a faster, friendlier way to order your favourites.</p>
        <ul>
          <li>
            <Icon name="check" size={18} /> Quick checkout with saved details
          </li>
          <li>
            <Icon name="check" size={18} /> Live order tracking
          </li>
          <li>
            <Icon name="check" size={18} /> Full order history at a glance
          </li>
        </ul>
      </aside>

      <div className="auth-main">
        <div className="auth-card">
          <span className="eyebrow">Create account</span>
          <h1>Sign up</h1>
          <p>It only takes a minute — no credit card required.</p>

          <form onSubmit={handleSubmit} noValidate>
            {serverError && <Alert variant="error">{serverError}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <div className="field" style={{ marginTop: 'var(--space-4)' }}>
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                className={`input${errors.fullName ? ' input--error' : ''}`}
                value={form.fullName}
                onChange={update('fullName')}
                placeholder="Jane Smith"
                autoComplete="name"
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  className={`input${errors.email ? ' input--error' : ''}`}
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field">
                <label htmlFor="signup-phone">Phone number</label>
                <input
                  id="signup-phone"
                  className={`input${errors.phone ? ' input--error' : ''}`}
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+266 5800 0000"
                  autoComplete="tel"
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="signup-password">Password</label>
                <div className="input-group">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input${errors.password ? ' input--error' : ''}`}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm input-group__action"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password ? (
                  <span className="field-error">{errors.password}</span>
                ) : (
                  <span className="field-hint">Use at least 8 characters for a strong password.</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="signup-confirm">Confirm password</label>
                <input
                  id="signup-confirm"
                  type={showPassword ? 'text' : 'password'}
                  className={`input${errors.confirmPassword ? ' input--error' : ''}`}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
              {submitting ? 'Creating your account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
