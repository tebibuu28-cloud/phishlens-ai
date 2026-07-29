// backend/middleware/auth.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase admin client (service role) for server‑side verification
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Express middleware to verify Supabase JWTs.
 * It expects an Authorization header with a Bearer token.
 * On success, attaches `req.user` containing the Supabase user payload.
 */
async function verifyJwt(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // supabase-admin SDK verifies the JWT signature, expiration, issuer and audience.
    const { data: { user }, error } = await supabaseAdmin.auth.api.getUser(token);
    if (error || !user) {
      throw error || new Error('Invalid token');
    }
    // Attach user info to request for downstream handlers.
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyJwt };
