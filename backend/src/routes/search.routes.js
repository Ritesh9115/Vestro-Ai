const express = require('express');
const { searchCompany } = require('../controllers/search.controller');

const router = express.Router();

router.get('/', searchCompany);

module.exports = router;
