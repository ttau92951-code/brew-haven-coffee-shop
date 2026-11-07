import { useEffect, useState } from 'react';

import { api } from '../../api/client.js';
import Alert from '../../components/Alert.jsx';
import Icon from '../../components/Icon.jsx';
import Loader from '../../components/Loader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { fileToCompressedDataUrl } from '../../utils/image.js';

export default function StaffSettingsPage() {
  const { token } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.get('/settings'), []);

  const [heroImage, setHeroImage] = useState('');
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Keep the field in step with the saved value until the user edits it.
  useEffect(() => {
    if (!dirty) {
      setHeroImage(data?.data?.heroImage || '');
    }
  }, [data, dirty]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToCompressedDataUrl(file, 1600, 0.82);
      setHeroImage(dataUrl);
      setDirty(true);
      setFormError('');
      setFeedback(null);
    } catch (uploadError) {
      setFormError(uploadError.message);
    }
  }

  async function save(event) {
    event.preventDefault();
    setFormError('');
    setFeedback(null);
    setSaving(true);

    try {
      const result = await api.put('/settings', { heroImage: heroImage.trim() }, token);
      setFeedback({ variant: 'success', message: result?.message || 'Store settings saved.' });
      setDirty(false);
      await reload();
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  function resetToDefault() {
    setHeroImage('');
    setDirty(true);
    setFormError('');
    setFeedback(null);
  }

  if (loading) return <Loader label="Loading store settings…" />;

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

  return (
    <section className="chart-card">
      <Alert variant="info">
        The image below is the background of the banner at the top of the home page. Paste a link
        to an image or upload one from your device, then save.
      </Alert>

      {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}

      <form onSubmit={save} noValidate style={{ marginTop: 'var(--space-4)' }}>
        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="field">
          <label htmlFor="hero-image">Hero background image URL</label>
          <input
            id="hero-image"
            className="input"
            value={heroImage.startsWith('data:') ? '' : heroImage}
            onChange={(event) => {
              setHeroImage(event.target.value);
              setDirty(true);
              setFeedback(null);
            }}
            placeholder="https://example.com/hero.jpg"
          />
          <span className="field-hint">
            Leave blank to use the built-in default image. Recommended size: 1920 × 1080.
          </span>
        </div>

        <div className="field">
          <span className="field-label">Or upload an image from your device</span>
          <input type="file" accept="image/*" className="input" onChange={handleUpload} />
        </div>

        <div className="field">
          <span className="field-label">Preview</span>
          <div
            style={{
              position: 'relative',
              minHeight: 220,
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              border: '1px solid var(--line)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--white)',
              textAlign: 'center',
              background: heroImage
                ? `linear-gradient(115deg, rgba(43, 29, 24, 0.9) 0%, rgba(59, 39, 32, 0.7) 100%), url("${heroImage}") center/cover no-repeat`
                : 'linear-gradient(115deg, #2b1d18 0%, #3b2720 100%)'
            }}
          >
            <div style={{ padding: 'var(--space-5)' }}>
              <strong style={{ display: 'block', fontSize: '1.2rem' }}>Great coffee, made just for you.</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.8 }}>
                {heroImage ? 'Preview of the home page banner' : 'Default banner (no custom image set)'}
              </span>
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--outline" onClick={resetToDefault}>
            <Icon name="refresh" size={16} /> Use default
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </section>
  );
}
