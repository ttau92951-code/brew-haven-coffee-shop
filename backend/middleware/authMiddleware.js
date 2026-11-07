import jwt from 'jsonwebtoken';

/**
 * Reads a Bearer token from the Authorization header.
 */
function extractToken(req) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return null;
  }

  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

function decodeToken(token) {
  const secret = process.env.JWT_SECRET;
  const decoded = jwt.verify(token, secret);

  return {
    id: decoded.sub,
    role: decoded.role,
    name: decoded.name,
    email: decoded.email,
    username: decoded.username
  };
}

/**
 * Requires a valid JWT. Responds with 401 when the token is missing or invalid.
 */
export function authenticate(req, res, next) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing from environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Authentication service is not configured.'
    });
  }

  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  try {
    req.user = decodeToken(token);
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired login session. Please log in again.'
    });
  }
}

/**
 * Attaches req.user when a valid token is supplied but never blocks the request.
 * Used on endpoints that work for guests and logged-in customers alike.
 */
export function optionalAuthenticate(req, res, next) {
  const token = extractToken(req);

  if (token && process.env.JWT_SECRET) {
    try {
      req.user = decodeToken(token);
    } catch {
      req.user = undefined;
    }
  }

  return next();
}

/**
 * Role-based authorization. Must be used after authenticate().
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }

    return next();
  };
}
