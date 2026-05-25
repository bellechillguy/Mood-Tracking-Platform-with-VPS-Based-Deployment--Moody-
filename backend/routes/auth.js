// routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const multer  = require('multer');
const path    = require('path');
const db      = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'moody_dev_secret';

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: require('path').join(__dirname, '../../uploads'),
    filename: (_, file, cb) => cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

// POST /api/auth/register
router.post('/register', avatarUpload.single('avatar'), (req, res) => {
  const { username, email, password, full_name, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  const safeRole = ['user', 'psychologist'].includes(role) ? role : 'user';
  try {
    const hash = bcrypt.hashSync(password, 10);
    const avatar = req.file ? req.file.filename : null;
    db.prepare(`
      INSERT INTO users (username, email, password_hash, role, approved, full_name, avatar_path)
      VALUES (?, ?, ?, ?, 0, ?, ?)
    `).run(username.trim(), email.trim(), hash, safeRole, full_name || username, avatar);
    res.json({ message: 'Registration submitted. Awaiting superadmin approval.' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.approved === 0) return res.status(403).json({ error: 'Account pending approval by superadmin' });
  if (user.approved === 2) return res.status(403).json({ error: 'Account registration was rejected' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name, avatar_path: user.avatar_path },
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, full_name, bio, avatar_path, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;