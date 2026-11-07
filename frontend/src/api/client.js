export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';

/**
 * Thin wrapper around the Fetch API.
 * - Adds JSON headers and the JWT Bearer token when provided.
 * - Normalises backend errors into Error objects with a `status` field.
 */
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error(
      'Unable to reach the Brew Haven server. Please check your connection and that the API is running.'
    );
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }

  return payload ?? { success: true };
}

export const api = {
  get: (path, token) => apiRequest(path, { token }),
  post: (path, body, token) => apiRequest(path, { method: 'POST', body, token }),
  put: (path, body, token) => apiRequest(path, { method: 'PUT', body, token }),
  patch: (path, body, token) => apiRequest(path, { method: 'PATCH', body, token }),
  del: (path, token) => apiRequest(path, { method: 'DELETE', token })
};
