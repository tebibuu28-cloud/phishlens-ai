// backend/middleware/csrfProtection.js
/**
 * Origin / Referer validation middleware for state‑changing requests (POST, PUT, PATCH, DELETE).
 * It rejects requests without a matching Origin (or Referer fallback) against the allowed origin.
 * This replaces the deprecated csurf library.
 */
module.exports.validateOrigin = function (req, res, next) {
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!unsafeMethods.includes(req.method)) return next();

  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const origin = req.get('origin');
  const referer = req.get('referer');

  // Helper to extract origin part from a full URL
  const extractOrigin = (url) => {
    try {
      const { protocol, host } = new URL(url);
      return `${protocol}//${host}`;
    } catch (_) {
      return null;
    }
  };

  const requestOrigin = origin || (referer && extractOrigin(referer));

  if (!requestOrigin) {
    return res.status(403).json({ error: 'Missing Origin/Referer header' });
  }
  if (requestOrigin !== allowedOrigin) {
    return res.status(403).json({ error: `Invalid origin ${requestOrigin}` });
  }
  // Passed validation
  next();
};
