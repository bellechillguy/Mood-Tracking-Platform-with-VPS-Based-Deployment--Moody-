// routes/content.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const db      = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const contentUpload = multer({
  storage: multer.diskStorage({
    destination: require('path').join(__dirname, '../../uploads'),
    filename: (_, file, cb) => cb(null, `content_${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// POST /api/content — publish wellness content (psychologist only)
router.post('/', requireAuth, requireRole('psychologist'), contentUpload.single('file'), (req, res) => {
  const { title, body, category } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });

  const file_path = req.file ? req.file.filename : null;
  const file_type = req.file ? req.file.mimetype : null;

  try {
    db.prepare(`
      INSERT INTO content (author_id, title, body, category, file_path, file_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, title, body, category || 'general', file_path, file_type);
    res.json({ message: 'Content published successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/content — all approved users can read content
router.get('/', requireAuth, (req, res) => {
  const content = db.prepare(`
    SELECT c.*, u.username AS author_name, u.full_name AS author_fullname, u.avatar_path AS author_avatar,
      (SELECT COUNT(*) FROM content_saves WHERE content_id = c.id) AS save_count,
      (SELECT 1 FROM content_saves WHERE content_id = c.id AND user_id = ?) AS saved_by_me
    FROM content c JOIN users u ON c.author_id = u.id
    ORDER BY c.created_at DESC
  `).all(req.user.id);
  res.json(content);
});

// GET /api/content/mine — psychologist's own content
router.get('/mine', requireAuth, requireRole('psychologist'), (req, res) => {
  const content = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM content_saves WHERE content_id = c.id) AS save_count
    FROM content c WHERE c.author_id = ? ORDER BY c.created_at DESC
  `).all(req.user.id);
  res.json(content);
});

// POST /api/content/:id/save — toggle save (user only)
router.post('/:id/save', requireAuth, requireRole('user'), (req, res) => {
  const existing = db.prepare('SELECT id FROM content_saves WHERE content_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (existing) {
    db.prepare('DELETE FROM content_saves WHERE content_id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ saved: false });
  } else {
    db.prepare('INSERT INTO content_saves (content_id, user_id) VALUES (?, ?)').run(req.params.id, req.user.id);
    res.json({ saved: true });
  }
});

// DELETE /api/content/:id — psychologist deletes own content
router.delete('/:id', requireAuth, requireRole('psychologist'), (req, res) => {
  const c = db.prepare('SELECT id FROM content WHERE id = ? AND author_id = ?').get(req.params.id, req.user.id);
  if (!c) return res.status(404).json({ error: 'Content not found or not yours' });
  db.prepare('DELETE FROM content WHERE id = ?').run(req.params.id);
  res.json({ message: 'Content deleted' });
});

module.exports = router;