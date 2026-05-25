// routes/moods.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const db      = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const MOOD_LABELS = ['', 'Devastated', 'Heavy', 'Okay', 'Good', 'Luminous'];

const moodUpload = multer({
  storage: multer.diskStorage({
    destination: require('path').join(__dirname, '../../uploads'),
    filename: (_, file, cb) => cb(null, `mood_${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)),
});

// POST /api/moods — log today's mood (users only)
router.post('/', requireAuth, requireRole('user'), moodUpload.single('image'), (req, res) => {
  const score = parseInt(req.body.mood_score);
  if (!score || score < 1 || score > 5) return res.status(400).json({ error: 'mood_score must be 1–5' });

  const date       = req.body.date || new Date().toISOString().split('T')[0];
  const journal    = req.body.journal || '';
  const image_path = req.file ? req.file.filename : null;
  const label      = MOOD_LABELS[score];

  try {
    const existing = db.prepare('SELECT id FROM mood_entries WHERE user_id = ? AND date = ?').get(req.user.id, date);
    if (existing) {
      db.prepare(`
        UPDATE mood_entries SET mood_score=?, mood_label=?, journal=?, image_path=COALESCE(?,image_path), created_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).run(score, label, journal, image_path, existing.id);
    } else {
      db.prepare(`
        INSERT INTO mood_entries (user_id, date, mood_score, mood_label, journal, image_path)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.user.id, date, score, label, journal, image_path);
    }
    res.json({ message: 'Mood logged', date, mood_score: score, mood_label: label });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/moods — user's own entries (last 90)
router.get('/', requireAuth, requireRole('user'), (req, res) => {
  const entries = db.prepare(
    'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY date DESC LIMIT 90'
  ).all(req.user.id);
  res.json(entries);
});

// GET /api/moods/stats — user's aggregated stats + AI insight
router.get('/stats', requireAuth, requireRole('user'), (req, res) => {
  const agg = db.prepare(`
    SELECT ROUND(AVG(mood_score),2) avg_mood, COUNT(*) total_entries,
           MIN(mood_score) lowest, MAX(mood_score) highest
    FROM mood_entries WHERE user_id = ?
  `).get(req.user.id);

  const dist = db.prepare(
    'SELECT mood_score, COUNT(*) count FROM mood_entries WHERE user_id = ? GROUP BY mood_score'
  ).all(req.user.id);

  const recent7 = db.prepare(
    'SELECT mood_score FROM mood_entries WHERE user_id = ? ORDER BY date DESC LIMIT 7'
  ).all(req.user.id);

  // Rule-based AI insight
  let insight = null;
  if (recent7.length >= 3) {
    const avg7 = recent7.reduce((s, e) => s + e.mood_score, 0) / recent7.length;
    if (avg7 < 2.5)       insight = { type: 'concern',  text: "You've been logging lower moods recently. Consider reaching out to a counselor or taking time for rest and self-care." };
    else if (avg7 >= 4.2) insight = { type: 'positive', text: "You're on a bright streak! Your recent moods reflect real resilience — keep nurturing what's working for you." };
    else if (avg7 >= 3.0) insight = { type: 'neutral',  text: "Your moods are fairly balanced. Small daily rituals — a walk, journaling, or calling a friend — can keep that stability strong." };
  }

  res.json({ stats: agg, distribution: dist, insight });
});

// GET /api/moods/patients — psychologist views all users + latest mood
router.get('/patients', requireAuth, requireRole('psychologist'), (req, res) => {
  const patients = db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_path,
      (SELECT COUNT(*)   FROM mood_entries WHERE user_id = u.id)                          AS total_entries,
      (SELECT ROUND(AVG(mood_score),1) FROM mood_entries WHERE user_id = u.id)            AS avg_mood,
      (SELECT mood_score FROM mood_entries WHERE user_id = u.id ORDER BY date DESC LIMIT 1) AS latest_mood,
      (SELECT mood_label FROM mood_entries WHERE user_id = u.id ORDER BY date DESC LIMIT 1) AS latest_label,
      (SELECT date       FROM mood_entries WHERE user_id = u.id ORDER BY date DESC LIMIT 1) AS last_entry
    FROM users u WHERE u.role = 'user' AND u.approved = 1
    ORDER BY last_entry DESC NULLS LAST
  `).all();
  res.json(patients);
});

// GET /api/moods/patient/:id — psychologist views one patient's full history
router.get('/patient/:id', requireAuth, requireRole('psychologist'), (req, res) => {
  const patient = db.prepare(
    'SELECT id, username, full_name, avatar_path FROM users WHERE id = ? AND role = \'user\''
  ).get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const entries = db.prepare(
    'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY date DESC'
  ).all(req.params.id);

  const agg = db.prepare(`
    SELECT ROUND(AVG(mood_score),2) avg_mood, COUNT(*) total FROM mood_entries WHERE user_id = ?
  `).get(req.params.id);

  res.json({ patient, entries, agg });
});

module.exports = router;