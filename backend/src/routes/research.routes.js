const express = require('express');
const { runResearch } = require('../controllers/research.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:symbol(*)', optionalAuth, runResearch);

module.exports = router;

