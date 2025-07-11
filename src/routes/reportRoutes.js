const express = require('express');
const router = express.Router();
const db = require('../../models'); 
const Report = db.Report;

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const report = await Report.create(req.body);
    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.findAll();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;
