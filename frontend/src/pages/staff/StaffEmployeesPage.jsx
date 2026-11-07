import { useMemo, useState } from 'react';

import { api } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import Loader, { EmptyState } from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { formatDate } from '../../utils/format.js';

const POSITIONS = [
  'Barista',
  'Cashier',
  'Shift Supervisor',
  'Baker',
  'Store Manager',
  'Other'
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  position: 'Barista',
  password: '',
  active: true
};

export default function StaffEmployeesPage() {
  const { token } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get('/employees', token), [token]);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const employees = data?.data || [];

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return employees;

    return employees.filter(
      (employee) =>
        employee.fullName.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        (employee.position || '').toLowerCase().includes(term)
    );
  }, [employees, search]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(employee) {
    setEditing(employee);
    setForm({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position || 'Barista',
      password: '',
      active: employee.active !== false
    });
    setFormError('');
    setModalOpen(true);
  }

  function update(field) {
    return (event) => {
      const value = field === 'active' ? event.target.checked : event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
      setFormError('');
    };
  }

  async function save(event) {
    event.preventDefault();
    setFormError('');

    if (!form.fullName.trim()) {
      setFormError('The employee\u2019s full name is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Please enter a valid work email address.');
      return;
    }

    if (!editing && form.password.length < 8) {
      setFormError('The assigned password must be at least 8 characters long.');
      return;
    }

    if (editing && form.password && form.password.length < 8) {
      setFormError('The new password must be at least 8 characters long.');
      return;
    }

    setSaving(true);

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position: form.position
    };

    if (editing) {
      payload.active = form.active;
      if (form.password) payload.password = form.password;
    } else {
      payload.password = form.password;
    }

    try {
      if (editing) {
        await api.put(`/employees/${editing.id}`, payload, token);
        setFeedback({ variant: 'success', message: `${payload.fullName}\u2019s details were updated.` });
      } else {
        await api.post('/employees', payload, token);
        setFeedback({
          variant: 'success',
          message: `${payload.fullName} was added and can now sign in with ${payload.email}.`
        });
      }

      setModalOpen(false);
      await reload();
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(employee) {
    try {
      await api.put(`/employees/${employee.id}`, { active: employee.active === false }, token);
      await reload();
    } catch (toggleError) {
      setFeedback({ variant: 'error', message: toggleError.message });
    }
  }

  async function remove(employee) {
    const confirmed = window.confirm(
      `Remove ${employee.fullName} from the team? They will no longer be able to sign in.`
    );
    if (!confirmed) return;

    try {
      await api.del(`/employees/${employee.id}`, token);
      setFeedback({ variant: 'success', message: `${employee.fullName} was removed from the team.` });
      await reload();
    } catch (deleteError) {
      setFeedback({ variant: 'error', message: deleteError.message });
    }
  }

  return (
    <>
      {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}

      <Alert variant="info">
        Add an employee below and assign them a work email and password. They sign in at the
        <strong> Staff login</strong> page with those details.
      </Alert>

      {loading && <Loader label="Loading employees…" />}

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
            <div className="row row--wrap">
              <label className="search-box">
                <span className="sr-only">Search employees</span>
                <Icon name="search" size={17} />
                <input
                  type="search"
                  className="input"
                  placeholder="Search by name, email or role…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <span className="results-count">
                {visible.length} of {employees.length} employees
              </span>
            </div>

            <button type="button" className="btn btn--primary" onClick={openCreate}>
              <Icon name="plus" size={16} /> Add employee
            </button>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="🧑‍🍳"
              title="No employees yet"
              description="Add your first employee so they can sign in and start working."
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Added</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((employee) => {
                    const active = employee.active !== false;

                    return (
                      <tr key={employee.id}>
                        <td>
                          <div className="row">
                            <span className="account__avatar" aria-hidden="true">
                              {employee.fullName.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <strong>{employee.fullName}</strong>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{employee.position || 'Barista'}</td>
                        <td>{employee.phone || '—'}</td>
                        <td>{formatDate(employee.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className={`badge ${active ? 'badge--available' : 'badge--unavailable'}`}
                            onClick={() => toggleActive(employee)}
                            title="Toggle this account"
                          >
                            {active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="btn btn--outline btn--sm" onClick={() => openEdit(employee)}>
                              <Icon name="edit" size={15} /> Edit
                            </button>
                            <button type="button" className="btn btn--danger btn--sm" onClick={() => remove(employee)}>
                              <Icon name="trash" size={15} /> Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <Modal
        open={modalOpen}
        title={editing ? `Edit ${editing.fullName}` : 'Add employee'}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <form onSubmit={save} noValidate>
          {formError && <Alert variant="error">{formError}</Alert>}

          <div className="form-grid" style={{ marginTop: 'var(--space-3)' }}>
            <div className="field">
              <label htmlFor="employee-name">Full name *</label>
              <input
                id="employee-name"
                className="input"
                value={form.fullName}
                onChange={update('fullName')}
                placeholder="Neo Mokoena"
              />
            </div>

            <div className="field">
              <label htmlFor="employee-position">Role</label>
              <select id="employee-position" className="select" value={form.position} onChange={update('position')}>
                {POSITIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="employee-email">Work email *</label>
              <input
                id="employee-email"
                type="email"
                className="input"
                value={form.email}
                onChange={update('email')}
                placeholder="neo@brewhaven.co.ls"
              />
              <span className="field-hint">They use this email to sign in.</span>
            </div>

            <div className="field">
              <label htmlFor="employee-phone">Phone</label>
              <input
                id="employee-phone"
                className="input"
                value={form.phone}
                onChange={update('phone')}
                placeholder="+266 5800 0000"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="employee-password">
              {editing ? 'New password (leave blank to keep the current one)' : 'Assigned password *'}
            </label>
            <input
              id="employee-password"
              type="text"
              className="input"
              value={form.password}
              onChange={update('password')}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <span className="field-hint">
              Share this password with the employee — they can change it later from their account.
            </span>
          </div>

          {editing && (
            <div className="field">
              <span className="field-label">Account status</span>
              <label className="checkbox" style={{ marginTop: 'var(--space-2)' }}>
                <input type="checkbox" checked={form.active} onChange={update('active')} />
                This employee can sign in
              </label>
            </div>
          )}

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add employee'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
