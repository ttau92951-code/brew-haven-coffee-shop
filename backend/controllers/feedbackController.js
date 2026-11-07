import { FEEDBACK_STATUSES, FEEDBACK_TYPES, ROLES } from '../config/constants.js';
import { getFeedback, saveFeedback } from '../data/store.js';
import { newId } from '../utils/ids.js';
import { createNotification } from '../utils/notifications.js';
import { ApiError, isNonEmptyString, isValidEmail } from '../utils/validation.js';

const MAX_MESSAGE_LENGTH = 1000;
const MAX_SUBJECT_LENGTH = 120;

function isCustomer(req) {
  return Boolean(req.user && req.user.role === ROLES.CUSTOMER);
}

/**
 * POST /api/feedback
 * Customers (and guests at checkout) leave a review, compliment or complaint.
 */
export async function createFeedback(req, res) {
  const { type, rating, subject, message, customerName, email, orderNumber } =
    req.body || {};

  const feedbackType = type === undefined || type === '' ? 'Review' : type;

  if (!FEEDBACK_TYPES.includes(feedbackType)) {
    throw new ApiError(
      400,
      `Invalid feedback type. Use one of: ${FEEDBACK_TYPES.join(', ')}.`
    );
  }

  if (!isNonEmptyString(message)) {
    throw new ApiError(400, 'Please tell us what you think before submitting.');
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(
      400,
      `Your message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`
    );
  }

  if (subject !== undefined && typeof subject !== 'string') {
    throw new ApiError(400, 'The subject must be text.');
  }

  if (subject && subject.trim().length > MAX_SUBJECT_LENGTH) {
    throw new ApiError(
      400,
      `The subject must be ${MAX_SUBJECT_LENGTH} characters or fewer.`
    );
  }

  // A star rating is required for reviews and optional for everything else.
  let score = null;

  if (feedbackType === 'Review' || (rating !== undefined && rating !== null)) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ApiError(400, 'Please give a rating between 1 and 5 stars.');
    }
    score = rating;
  }

  const signedIn = isCustomer(req);
  const name = signedIn ? req.user.name : customerName;

  if (!isNonEmptyString(name)) {
    throw new ApiError(400, 'Please provide your name.');
  }

  if (!signedIn && email !== undefined && email !== '' && !isValidEmail(email)) {
    throw new ApiError(400, 'Please provide a valid email address.');
  }

  if (orderNumber !== undefined && typeof orderNumber !== 'string') {
    throw new ApiError(400, 'The order number must be text.');
  }

  const now = new Date().toISOString();

  const record = {
    id: newId(),
    customerId: signedIn ? req.user.id : null,
    customerName: name.trim(),
    email: signedIn
      ? req.user.email || ''
      : email
        ? email.trim().toLowerCase()
        : '',
    type: feedbackType,
    rating: score,
    subject: subject ? subject.trim() : '',
    message: message.trim(),
    orderNumber: orderNumber ? orderNumber.trim() : '',
    status: 'New',
    reply: null,
    repliedAt: null,
    createdAt: now,
    updatedAt: now
  };

  const feedback = await getFeedback();
  feedback.unshift(record);
  await saveFeedback(feedback);

  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback!',
    data: record
  });
}

/**
 * GET /api/feedback/public
 * Public: the highest-rated customer reviews are featured on the home page.
 * Only the author's name, rating, subject and message are exposed.
 */
export async function listPublicReviews(req, res) {
  const requested = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 12) : 6;

  const feedback = await getFeedback();

  const reviews = feedback
    .filter(
      (record) =>
        record.type === 'Review' &&
        typeof record.rating === 'number' &&
        record.rating >= 4 &&
        Boolean(record.message)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map((record) => ({
      id: record.id,
      customerName: record.customerName,
      rating: record.rating,
      subject: record.subject,
      message: record.message,
      createdAt: record.createdAt
    }));

  res.json({ success: true, count: reviews.length, data: reviews });
}

/** GET /api/feedback/me - the signed-in customer's own messages */
export async function listMyFeedback(req, res) {
  const feedback = await getFeedback();
  const mine = feedback
    .filter((record) => record.customerId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, count: mine.length, data: mine });
}

/** GET /api/feedback - staff only */
export async function listFeedback(req, res) {
  const all = await getFeedback();
  const { type, status, search } = req.query;

  let records = all;

  if (type && type !== 'All') {
    records = records.filter((record) => record.type === type);
  }

  if (status && status !== 'All') {
    records = records.filter((record) => record.status === status);
  }

  if (search && String(search).trim()) {
    const term = String(search).trim().toLowerCase();

    records = records.filter((record) =>
      [record.customerName, record.subject, record.message, record.orderNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }

  const rated = all.filter((record) => typeof record.rating === 'number');

  const summary = {
    total: all.length,
    new: all.filter((record) => record.status === 'New').length,
    resolved: all.filter((record) => record.status === 'Resolved').length,
    reviews: all.filter((record) => record.type === 'Review').length,
    compliments: all.filter((record) => record.type === 'Compliment').length,
    complaints: all.filter((record) => record.type === 'Complaint').length,
    averageRating: rated.length
      ? Math.round(
          (rated.reduce((sum, record) => sum + record.rating, 0) / rated.length) * 10
        ) / 10
      : 0
  };

  res.json({
    success: true,
    count: records.length,
    summary,
    data: [...records].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  });
}

/** PATCH /api/feedback/:id - staff only */
export async function updateFeedbackStatus(req, res) {
  const { status } = req.body || {};

  if (!FEEDBACK_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Use one of: ${FEEDBACK_STATUSES.join(', ')}.`
    );
  }

  const feedback = await getFeedback();
  const index = feedback.findIndex((record) => record.id === req.params.id);

  if (index === -1) {
    throw new ApiError(404, 'Feedback not found.');
  }

  feedback[index] = {
    ...feedback[index],
    status,
    updatedAt: new Date().toISOString()
  };

  await saveFeedback(feedback);

  res.json({
    success: true,
    message: 'Feedback status updated.',
    data: feedback[index]
  });
}

/**
 * POST /api/feedback/:id/reply - staff only
 * Staff answer a customer message; the reply is pushed to the customer as a
 * notification so they see it in their account.
 */
export async function replyToFeedback(req, res) {
  const { message } = req.body || {};

  if (!isNonEmptyString(message)) {
    throw new ApiError(400, 'A reply message is required.');
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(
      400,
      `Your reply must be ${MAX_MESSAGE_LENGTH} characters or fewer.`
    );
  }

  const feedback = await getFeedback();
  const index = feedback.findIndex((record) => record.id === req.params.id);

  if (index === -1) {
    throw new ApiError(404, 'Feedback not found.');
  }

  const current = feedback[index];
  const now = new Date().toISOString();

  const reply = {
    message: message.trim(),
    staffName: req.user.name || req.user.username || 'Brew Haven staff',
    at: now
  };

  feedback[index] = {
    ...current,
    reply,
    repliedAt: now,
    status: current.status === 'New' ? 'Read' : current.status,
    updatedAt: now
  };

  await saveFeedback(feedback);

  if (current.customerId) {
    await createNotification(current.customerId, {
      type: 'feedback_reply',
      title: 'Brew Haven replied to your message',
      message:
        reply.message.length > 140
          ? `${reply.message.slice(0, 140)}…`
          : reply.message,
      link: '/reviews'
    });
  }

  res.json({
    success: true,
    message: 'Reply sent to the customer.',
    data: feedback[index]
  });
}
