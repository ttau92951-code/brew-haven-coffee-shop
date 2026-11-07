import { getSettings, saveSettings } from '../data/store.js';
import { ApiError } from '../utils/validation.js';

// Uploaded images arrive as base64 data URLs, so allow a generous (but bounded) size.
const MAX_IMAGE_LENGTH = 1_400_000;

/** GET /api/settings - public: the storefront reads the hero image from here. */
export async function getStoreSettings(req, res) {
  const settings = await getSettings();

  res.json({
    success: true,
    data: {
      heroImage: settings.heroImage || '',
      updatedAt: settings.updatedAt || null
    }
  });
}

/**
 * PUT /api/settings - staff and administrators.
 * Sending an empty heroImage restores the built-in default image.
 */
export async function updateStoreSettings(req, res) {
  const { heroImage } = req.body || {};

  if (heroImage !== undefined && typeof heroImage !== 'string') {
    throw new ApiError(400, 'The hero image must be a URL or an uploaded image.');
  }

  const value = typeof heroImage === 'string' ? heroImage.trim() : '';

  if (value.length > MAX_IMAGE_LENGTH) {
    throw new ApiError(400, 'That image is too large. Please choose a smaller file.');
  }

  const settings = await getSettings();
  const updated = {
    ...settings,
    heroImage: value,
    updatedAt: new Date().toISOString()
  };

  await saveSettings(updated);

  res.json({
    success: true,
    message: value
      ? 'The home page hero image was updated.'
      : 'The home page hero image was reset to the default.',
    data: updated
  });
}
