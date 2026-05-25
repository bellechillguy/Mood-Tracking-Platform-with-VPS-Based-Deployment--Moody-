// server.js — Moody Platform Backend
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');
const path    = require('path');

// Initialize DB (also seeds superadmin)
require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (stored at root /uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/moods',   require('./routes/moods'));
app.use('/api/content', require('./routes/content'));
app.use('/api/admin',   require('./routes/admin'));
app.use('/api/quote',   require('./routes/quote'));

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// SPA fallback — serves index.html for any unknown GET
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Moody] Server running → http://localhost:${PORT}`);
  console.log(`[Moody] Superadmin login: admin@moody.stei.cloud / admin123`);
});
