const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');

router.get('/', packageController.getPackages);

module.exports = router;
