import { useState } from 'react';

import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';

const DETAILS = [
  { icon: 'pin', title: 'Address', lines: ['12 Kingsway Avenue', 'Maseru 100, Lesotho'] },
  { icon: 'phone', title: 'Phone', lines: ['+266 5800 0000', 'Mon–Sat, 07:00–19:00'] },
  { icon: 'mail', title: 'Email', lines: ['hello@brewhaven.co.ls', 'orders@brewhaven.co.ls'] }
];

const HOURS = [
  { day: 'Monday – Friday', time: '07:00 – 19:00' },
  { day: 'Saturday', time: '08:00 – 18:00' },
  { day: 'Sunday', time: '09:00 – 15:00' },
  { day: 'Public holidays', time: '09:00 – 14:00' }
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please complete your name, email address and message.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    // The assignment scope covers menu and orders; enquiries are acknowledged locally.
    setStatus('Thank you! Your message has been received. Our team will get back to you within one working day.');
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <div className="page container">
      <div className="section-head">
        <span className="eyebrow">Contact</span>
        <h1>We would love to hear from you</h1>
        <p>Questions about an order, a booking or our menu? Send us a message and we&apos;ll be in touch.</p>
      </div>

      <div className="info-grid" style={{ marginBottom: 'var(--space-7)' }}>
        {DETAILS.map((detail) => (
          <div className="info-card" key={detail.title}>
            <h3>
              <Icon name={detail.icon} size={18} /> {detail.title}
            </h3>
            {detail.lines.map((line) => (
              <p key={line} className="text-muted">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div className="form-card">
          <h2>Send us a message</h2>
          <p style={{ marginBottom: 'var(--space-5)' }}>All fields marked with * are required.</p>

          <form onSubmit={handleSubmit} noValidate>
            {error && <Alert variant="error">{error}</Alert>}
            {status && <Alert variant="success">{status}</Alert>}

            <div className="form-grid" style={{ marginTop: 'var(--space-4)' }}>
              <div className="field">
                <label htmlFor="contact-name">Your name *</label>
                <input id="contact-name" className="input" value={form.name} onChange={update('name')} placeholder="Jane Smith" />
              </div>

              <div className="field">
                <label htmlFor="contact-email">Email address *</label>
                <input id="contact-email" type="email" className="input" value={form.email} onChange={update('email')} placeholder="jane@example.com" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="contact-subject">Subject</label>
              <input id="contact-subject" className="input" value={form.subject} onChange={update('subject')} placeholder="Order enquiry" />
            </div>

            <div className="field">
              <label htmlFor="contact-message">Message *</label>
              <textarea
                id="contact-message"
                className="textarea"
                value={form.message}
                onChange={update('message')}
                placeholder="How can we help?"
              />
            </div>

            <button type="submit" className="btn btn--primary btn--lg">
              Send message
            </button>
          </form>
        </div>

        <aside className="order-summary">
          <h3>Opening hours</h3>
          <div className="stack" style={{ marginTop: 'var(--space-4)' }}>
            {HOURS.map((entry) => (
              <div className="row row--between" key={entry.day}>
                <span className="text-muted">{entry.day}</span>
                <strong>{entry.time}</strong>
              </div>
            ))}
          </div>

          <div className="muted-box" style={{ marginTop: 'var(--space-5)' }}>
            <strong>Prefer to order online?</strong>
            <p style={{ marginTop: 'var(--space-2)' }}>
              Skip the queue entirely — place your order on our menu page and collect it when it&apos;s ready.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
