import { MENU_CATEGORIES } from '../config/constants.js';
import { getMenu, saveMenu } from '../data/store.js';
import { newId } from '../utils/ids.js';
import { ApiError, isNonEmptyString, isPositiveNumber } from '../utils/validation.js';

const MAX_IMAGE_LENGTH = 400000;

function validateCategory(category) {
  if (!isNonEmptyString(category) || !MENU_CATEGORIES.includes(category)) {
    throw new ApiError(
      400,
      `Category must be one of: ${MENU_CATEGORIES.join(', ')}.`
    );
  }
}

function validateImage(image) {
  if (image === undefined || image === null || image === '') {
    return '';
  }

  if (typeof image !== 'string' || image.length > MAX_IMAGE_LENGTH) {
    throw new ApiError(400, 'Image must be a valid URL or data string.');
  }

  return image.trim();
}

/** GET /api/menu - public */
export async function listMenu(req, res) {
  const menu = await getMenu();
  res.json({ success: true, count: menu.length, data: menu });
}

/** GET /api/menu/:id - public */
export async function getMenuItem(req, res) {
  const menu = await getMenu();
  const item = menu.find((record) => record.id === req.params.id);

  if (!item) {
    throw new ApiError(404, 'Menu item not found.');
  }

  res.json({ success: true, data: item });
}

/** POST /api/menu - staff only */
export async function createMenuItem(req, res) {
  const { name, category, description, price, available, image } = req.body || {};

  if (!isNonEmptyString(name)) {
    throw new ApiError(400, 'Product name is required.');
  }

  validateCategory(category);

  if (typeof description !== 'string') {
    throw new ApiError(400, 'Description must be text.');
  }

  if (!isPositiveNumber(price)) {
    throw new ApiError(400, 'Price must be a positive number.');
  }

  if (available !== undefined && typeof available !== 'boolean') {
    throw new ApiError(400, 'Availability must be true or false.');
  }

  const menu = await getMenu();
  const now = new Date().toISOString();

  const item = {
    id: newId(),
    name: name.trim(),
    category,
    description: description.trim(),
    price,
    available: available ?? true,
    image: validateImage(image),
    createdAt: now,
    updatedAt: now
  };

  menu.push(item);
  await saveMenu(menu);

  res.status(201).json({
    success: true,
    message: 'Menu item added successfully.',
    data: item
  });
}

/** PUT /api/menu/:id - staff only */
export async function updateMenuItem(req, res) {
  const menu = await getMenu();
  const index = menu.findIndex((record) => record.id === req.params.id);

  if (index === -1) {
    throw new ApiError(404, 'Menu item not found.');
  }

  const { name, category, description, price, available, image } = req.body || {};

  if (name !== undefined && !isNonEmptyString(name)) {
    throw new ApiError(400, 'Name must be a non-empty string.');
  }

  if (category !== undefined) {
    validateCategory(category);
  }

  if (description !== undefined && typeof description !== 'string') {
    throw new ApiError(400, 'Description must be text.');
  }

  if (price !== undefined && !isPositiveNumber(price)) {
    throw new ApiError(400, 'Price must be a positive number.');
  }

  if (available !== undefined && typeof available !== 'boolean') {
    throw new ApiError(400, 'Availability must be true or false.');
  }

  menu[index] = {
    ...menu[index],
    ...(name !== undefined && { name: name.trim() }),
    ...(category !== undefined && { category }),
    ...(description !== undefined && { description: description.trim() }),
    ...(price !== undefined && { price }),
    ...(available !== undefined && { available }),
    ...(image !== undefined && { image: validateImage(image) }),
    updatedAt: new Date().toISOString()
  };

  await saveMenu(menu);

  res.json({
    success: true,
    message: 'Menu item updated successfully.',
    data: menu[index]
  });
}

/** DELETE /api/menu/:id - staff only */
export async function deleteMenuItem(req, res) {
  const menu = await getMenu();
  const index = menu.findIndex((record) => record.id === req.params.id);

  if (index === -1) {
    throw new ApiError(404, 'Menu item not found.');
  }

  const [deleted] = menu.splice(index, 1);
  await saveMenu(menu);

  res.json({
    success: true,
    message: 'Menu item deleted successfully.',
    data: deleted
  });
}
