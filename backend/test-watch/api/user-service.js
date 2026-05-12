// API service for user management
const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/users', (req, res) => {
  res.json({ users: [] });
});

module.exports = router;
EOF