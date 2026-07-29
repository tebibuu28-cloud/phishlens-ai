// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Secure HTTP headers
const rateLimit = require('express-rate-limit'); // Rate limiting
const csurf = require('csurf'); // CSRF protection
const cookieParser = require('cookie-parser'); // Needed for csurf
require('dotenv').config(); // Load environment variables

const app = express();
// Enable security middlewares
app.use(helmet()); // Set various HTTP headers for security
// Strict CORS: only allow origin from env or same origin
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' })); // Limit request body size
app.use(cookieParser()); // Parse cookies for CSRF
// Rate limiting: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
// CSRF protection for state‑changing routes
app.use(csurf({ cookie: true }));

// Protected Dashboard route
app.get('/dashboard', (req, res, next) => {
  // Simple token check – in production verify JWT via Supabase admin API
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  // Basic token presence validation; replace with proper verification later
  if (!token) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  // TODO: verify token with Supabase admin SDK
  // If verification passes, return dashboard data
  res.json({
    status: 'ok',
    message: 'Dashboard endpoint is secured',
    timestamp: new Date().toISOString()
  });
});

// Validate required environment variables
const requiredEnv = ['PORT'];
const missing = requiredEnv.filter((v) => !process.env[v]);
if (missing.length) {
  console.error('Missing required env vars:', missing.join(', '));
  process.exit(1);
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
});
// Centralized error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.code === 'EBADCSRFTOKEN') {
    // CSRF token errors
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
