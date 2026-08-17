const express = require('express');
const { getHistory, getHistoryEntry, deleteHistoryEntry, getResearchTimeline } = require('../controllers/research-history.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);
router.get('/', getHistory);
// Timeline route MUST come before /:id to avoid conflict
router.get('/timeline/:symbol', getResearchTimeline);
router.get('/:id', getHistoryEntry);
router.delete('/:id', deleteHistoryEntry);

module.exports = router;
