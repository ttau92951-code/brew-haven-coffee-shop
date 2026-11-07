/**
 * Handles requests that do not match any API route.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
}

/**
 * Central error handler.
 * ApiError instances keep their status and message; everything else is a 500.
 * Details are logged on the server but never leaked to the client.
 */
export function errorHandler(err, req, res, next) {
  const isApiError = err && err.name === 'ApiError';
  const status = isApiError && Number.isInteger(err.status) ? err.status : 500;

  if (!isApiError || status >= 500) {
    console.error('Server error:', err);
  }

  res.status(status).json({
    success: false,
    message: isApiError
      ? err.message
      : 'Internal server error. Please try again later.'
  });
}
