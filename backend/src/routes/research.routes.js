const express = require('express');
const { runResearch } = require('../controllers/research.controller');

const router = express.Router();

router.get('/:symbol', runResearch);

module.exports = router;
