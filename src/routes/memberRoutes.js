const express = require('express');
const router = express.Router();
const db = require('../../models');
const Member = db.Member;

// GET /api/members — fetch all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

module.exports = router;
