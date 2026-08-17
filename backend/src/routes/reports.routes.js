const express = require('express');
const { getReports, saveReport, updateReport, deleteReport, exportReportPDF } = require('../controllers/saved-reports.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);
router.get('/', getReports);
router.post('/', saveReport);
router.patch('/:id', updateReport);
router.delete('/:id', deleteReport);
router.get('/:id/export', exportReportPDF);

module.exports = router;
