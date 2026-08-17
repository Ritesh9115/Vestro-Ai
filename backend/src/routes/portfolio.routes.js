const express = require('express');
const { getPortfolio, addHolding, updateHolding, deleteHolding, getPortfolioAnalytics } = require('../controllers/portfolio.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { addHoldingValidator } = require('../middleware/validate.middleware');
const router = express.Router();

router.use(authenticate);
router.get('/', getPortfolio);
router.get('/analytics', getPortfolioAnalytics);
router.post('/holdings', addHoldingValidator, addHolding);
router.patch('/holdings/:id', updateHolding);
router.delete('/holdings/:id', deleteHolding);

module.exports = router;
