const express = require('express');
const { getWatchlist, addToWatchlist, removeFromWatchlist, setAlert } = require('../controllers/watchlist.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { addWatchlistValidator } = require('../middleware/validate.middleware');
const router = express.Router();

router.use(authenticate);
router.get('/', getWatchlist);
router.post('/', addWatchlistValidator, addToWatchlist);
router.delete('/:symbol', removeFromWatchlist);
router.patch('/:symbol/alert', setAlert);

module.exports = router;
