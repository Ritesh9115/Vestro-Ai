const express = require('express');
const { getTrending, getMostResearched, getTopConfidence, getMostSaved, getTopPerforming, getHighestRisk } = require('../controllers/analytics.controller');
const router = express.Router();

// Public endpoints — no auth required
router.get('/trending', getTrending);
router.get('/most-researched', getMostResearched);
router.get('/top-confidence', getTopConfidence);
router.get('/most-saved', getMostSaved);
router.get('/top-performing', getTopPerforming);
router.get('/highest-risk', getHighestRisk);

module.exports = router;
