// routes/admin.js
const express = require('express');
const db = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users
router.get('/users', requireAuth, requireRole('superadmin'), (req, res) => {
  const users = db.prepare(`
    SELECT id, username, email, role, approved, full_name, avatar_path, created_at
    FROM users WHERE role != 'superadmin' ORDER BY created_at DESC
  `).all();
  res.json(users);
});

// GET /api/admin/pending
router.get('/pending', requireAuth, requireRole('superadmin'), (req, res) => {
  const pending = db.prepare(`
    SELECT id, username, email, role, full_name, avatar_path, created_at
    FROM users WHERE approved = 0 ORDER BY created_at ASC
  `).all();
  res.json(pending);
});

// PATCH /api/admin/users/:id/status — approve (1) or reject (2)
router.patch('/users/:id/status', requireAuth, requireRole('superadmin'), (req, res) => {
  const { status } = req.body;
  if (![1, 2].includes(Number(status))) return res.status(400).json({ error: 'Status must be 1 (approve) or 2 (reject)' });
  db.prepare('UPDATE users SET approved = ? WHERE id = ? AND role != \'superadmin\'').run(status, req.params.id);
  res.json({ message: status == 1 ? 'User approved' : 'User rejected' });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAuth, requireRole('superadmin'), (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ? AND role != 'superadmin'").run(req.params.id);
  res.json({ message: 'User removed' });
});

// GET /api/admin/stats
router.get('/stats', requireAuth, requireRole('superadmin'), (req, res) => {
  const s = {
    total_users:         db.prepare("SELECT COUNT(*) c FROM users WHERE role='user'").get().c,
    total_psychologists: db.prepare("SELECT COUNT(*) c FROM users WHERE role='psychologist'").get().c,
    pending_approvals:   db.prepare("SELECT COUNT(*) c FROM users WHERE approved=0 AND role!='superadmin'").get().c,
    total_moods:         db.prepare("SELECT COUNT(*) c FROM mood_entries").get().c,
    total_content:       db.prepare("SELECT COUNT(*) c FROM content").get().c,
    moods_today:         db.prepare("SELECT COUNT(*) c FROM mood_entries WHERE date=date('now')").get().c,
  };
  res.json(s);
});

module.exports = router;