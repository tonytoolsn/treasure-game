const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '請填寫帳號與密碼' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: '帳號已存在' });

  const password_hash = await bcrypt.hash(password, 10);
  const { lastInsertRowid } = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, password_hash);

  const token = jwt.sign({ userId: lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '請填寫帳號與密碼' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ error: '帳號或密碼錯誤' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: '帳號或密碼錯誤' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

module.exports = router;
