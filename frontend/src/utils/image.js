const IMAGE_ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image';

export const CATEGORY_ICONS = {
  Coffee: '☕',
  Tea: '🍵',
  Pastries: '🥐',
  'Cold Drinks': '🧊',
  Desserts: '🍰',
  Drinks: '🥤',
  Other: '🍽️'
};

/** Returns a friendly emoji for a menu category. */
export function categoryIcon(category = '') {
  if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];

  const value = String(category).toLowerCase();
  if (value.includes('coffee')) return '☕';
  if (value.includes('tea')) return '🍵';
  if (value.includes('pastr')) return '🥐';
  if (value.includes('cold') || value.includes('drink')) return '🥤';
  if (value.includes('dessert')) return '🍰';
  return '🍽️';
}

/**
 * Resolves the image for a menu item.
 * Staff can store an image URL; otherwise a themed image is generated
 * from the product name and category.
 */
export function productImage(item = {}) {
  if (item.image) return item.image;

  const prompt = `${item.name || 'coffee shop product'}${
    item.category ? `, ${item.category}` : ''
  }, professional cafe photography, appetising, warm natural lighting`;

  return `${IMAGE_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=square`;
}

/**
 * Reads an uploaded image file and returns a compressed JPEG data URL.
 * Images are resized client-side so they stay small enough to persist in Redis.
 */
export function fileToCompressedDataUrl(file, maxSize = 720, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read that image file.'));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('That image could not be processed.'));

      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

