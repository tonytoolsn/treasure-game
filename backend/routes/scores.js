const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, (req, res) => {
  const { score, result } = req.body;
  if (score === undefined || !result) return res.status(400).json({ error: '缺少分數或結果' });

  db.prepare('INSERT INTO game_scores (user_id, score, result) VALUES (?, ?, ?)').run(req.userId, score, result);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT score, result, created_at FROM game_scores WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.userId);
  res.json(rows);
});

module.exports = router;
