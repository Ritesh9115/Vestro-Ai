const express = require('express');
const { runSimulation, runScenario, runStressTest, runWhatIf, runQuarterly } = require('../controllers/simulator.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { simulatorValidator } = require('../middleware/validate.middleware');
const router = express.Router();

router.post('/', authenticate, simulatorValidator, runSimulation);
router.post('/scenario', optionalAuth, runScenario);
router.post('/stress', optionalAuth, runStressTest);
router.post('/whatif', optionalAuth, runWhatIf);
router.post('/quarterly', optionalAuth, runQuarterly);

module.exports = router;
