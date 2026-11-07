import { useMemo, useState } from 'react';

import { api } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import Loader, { EmptyState } from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { formatCurrency } from '../../utils/format.js';
import { CATEGORY_ICONS, fileToCompressedDataUrl, productImage } from '../../utils/image.js';

const CATEGORIES = Object.keys(CATEGORY_ICONS).filter(
  (category) => !['Drinks', 'Other'].includes(category)
);

const EMPTY_FORM = {
  name: '',
  category: 'Coffee',
  description: '',
  price: '',
  available: true,
  image: ''
};

export default function StaffMenuPage() {
  const { token } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get('/menu'), []);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const menu = data?.data || [];

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return menu.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesTerm = !term || item.name.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [menu, search, category]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description || '',
      price: String(item.price),
      available: item.available !== false,
      image: item.image || ''
    });
    setFormError('');
    setModalOpen(true);
  }

  function update(field) {
    return (event) => {
      const value = field === 'available' ? event.target.checked : event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
      setFormError('');
    };
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setForm((current) => ({ ...current, image: dataUrl }));
      setFormError('');
    } catch (uploadError) {
      setFormError(uploadError.message);
    }
  }

  async function save(event) {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Price must be a positive number.');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price,
      available: form.available,
      image: form.image
    };

    try {
      if (editing) {
        await api.put(`/menu/${editing.id}`, payload, token);
        setFeedback({ variant: 'success', message: `${payload.name} was updated.` });
      } else {
        await api.post('/menu', payload, token);
        setFeedback({ variant: 'success', message: `${payload.name} was added to the menu.` });
      }

      setModalOpen(false);
      await reload();
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item) {
    try {
      await api.put(`/menu/${item.id}`, { available: item.available === false }, token);
      await reload();
    } catch (toggleError) {
      setFeedback({ variant: 'error', message: toggleError.message });
    }
  }

  async function remove(item) {
    const confirmed = window.confirm(`Delete "${item.name}" from the menu? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.del(`/menu/${item.id}`, token);
      setFeedback({ variant: 'success', message: `${item.name} was deleted.` });
      await reload();
    } catch (deleteError) {
      setFeedback({ variant: 'error', message: deleteError.message });
    }
  }

  return (
    <>
      {feedback && (
        <Alert variant={feedback.variant}>{feedback.message}</Alert>
      )}

      {loading && <Loader label="Loading menu…" />}

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
                <span className="sr-only">Search menu items</span>
                <Icon name="search" size={17} />
                <input
                  type="search"
                  className="input"
                  placeholder="Search menu items…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select className="select select--auto" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="All">All categories</option>
                {CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <span className="results-count">
                {visible.length} of {menu.length} items
              </span>
            </div>

            <button type="button" className="btn btn--primary" onClick={openCreate}>
              <Icon name="plus" size={16} /> Add menu item
            </button>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="☕"
              title="No menu items found"
              description="Adjust your search or add a new product to the menu."
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const available = item.available !== false;

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="row">
                            <img className="table-thumb" src={productImage(item)} alt={item.name} />
                            <div>
                              <strong>{item.name}</strong>
                              <div className="text-muted" style={{ fontSize: '0.76rem', maxWidth: '320px' }}>
                                {item.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{item.category}</td>
                        <td>
                          <strong>{formatCurrency(item.price)}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`badge ${available ? 'badge--available' : 'badge--unavailable'}`}
                            onClick={() => toggleAvailability(item)}
                            title="Toggle availability"
                          >
                            {available ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="btn btn--outline btn--sm" onClick={() => openEdit(item)}>
                              <Icon name="edit" size={15} /> Edit
                            </button>
                            <button type="button" className="btn btn--danger btn--sm" onClick={() => remove(item)}>
                              <Icon name="trash" size={15} /> Delete
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
        title={editing ? `Edit ${editing.name}` : 'Add menu item'}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <form onSubmit={save} noValidate>
          {formError && <Alert variant="error">{formError}</Alert>}

          <div className="form-grid" style={{ marginTop: 'var(--space-3)' }}>
            <div className="field">
              <label htmlFor="item-name">Product name *</label>
              <input id="item-name" className="input" value={form.name} onChange={update('name')} placeholder="Caramel Latte" />
            </div>

            <div className="field">
              <label htmlFor="item-category">Category *</label>
              <select id="item-category" className="select" value={form.category} onChange={update('category')}>
                {CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="item-description">Description</label>
            <textarea
              id="item-description"
              className="textarea"
              value={form.description}
              onChange={update('description')}
              placeholder="Describe the product for customers…"
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="item-price">Price (M) *</label>
              <input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={form.price}
                onChange={update('price')}
                placeholder="35.00"
              />
            </div>

            <div className="field">
              <span className="field-label">Availability</span>
              <label className="checkbox" style={{ marginTop: 'var(--space-2)' }}>
                <input type="checkbox" checked={form.available} onChange={update('available')} />
                Available for ordering
              </label>
            </div>
          </div>

          <div className="field">
            <label htmlFor="item-image">Product image URL</label>
            <input
              id="item-image"
              className="input"
              value={form.image.startsWith('data:') ? '' : form.image}
              onChange={update('image')}
              placeholder="https://example.com/latte.jpg"
            />
            <span className="field-hint">Leave blank to use an automatically generated image.</span>
          </div>

          <div className="field">
            <span className="field-label">Or upload an image</span>
            <input type="file" accept="image/*" className="input" onChange={handleImageUpload} />
          </div>

          {form.image && (
            <div className="row" style={{ marginBottom: 'var(--space-4)' }}>
              <img
                src={form.image}
                alt="Product preview"
                style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setForm((current) => ({ ...current, image: '' }))}>
                Remove image
              </button>
            </div>
          )}

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
