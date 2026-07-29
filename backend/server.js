// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Secure HTTP headers
const rateLimit = require('express-rate-limit'); // Rate limiting
require('dotenv').config(); // Load env vars

// Supabase admin client (service role) for server‑side operations
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Auth middleware – verifies Supabase JWT and attaches user payload
const { verifyJwt } = require('./middleware/auth');

const app = express();

// Security middlewares
app.use(helmet());
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' })); // body size limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use(limiter);
// Origin/Referer validation for state‑changing requests
const { validateOrigin } = require('./middleware/csrfProtection');
app.use(validateOrigin);

// ---------- Authentication Routes (session cookies) ----------
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const maxAge = 60 * 60 * 1000; // 1 hour
    res.cookie('session_token', data.session.access_token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge });
    res.json({ message: 'Logged in' });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie('session_token');
  res.json({ message: 'Logged out' });
});

app.post('/auth/refresh', async (req, res) => {
  const refreshToken = req.body.refresh_token;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw error;
    const maxAge = 60 * 60 * 1000;
    res.cookie('session_token', data.session.access_token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge });
    res.json({ message: 'Token refreshed' });
  } catch (err) {
    console.error('Refresh error:', err.message);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ---------- Protected API Endpoints ----------
app.get('/dashboard', verifyJwt, (req, res) => {
  res.json({ status: 'ok', message: 'Dashboard endpoint is secured', userId: req.user.id, timestamp: new Date().toISOString() });
});

// Scan history – only returns scans owned by the authenticated user
app.get('/api/scans', verifyJwt, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('email_analysis').select('*').eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ scans: data });
  } catch (err) {
    console.error('Error fetching scans:', err.message);
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

// Single report – ownership enforced
app.get('/api/reports/:id', verifyJwt, async (req, res) => {
  const reportId = req.params.id;
  try {
    const { data, error } = await supabaseAdmin.from('email_analysis').select('*').eq('id', reportId).eq('user_id', req.user.id).single();
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Report not found' });
      throw error;
    }
    res.json({ report: data });
  } catch (err) {
    console.error('Error fetching report:', err.message);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// ---------- Environment Validation & Startup ----------
const requiredEnv = ['PORT', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredEnv.filter(v => !process.env[v]);
if (missing.length) {
  console.error('Missing required env vars:', missing.join(', '));
  process.exit(1);
}
const PORT = process.env.PORT || 5000;
// Centralized error handler (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`🚀 Backend server listening on http://localhost:${PORT}`));
