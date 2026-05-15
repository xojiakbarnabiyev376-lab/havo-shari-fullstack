const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middlewares/auth');

router.get('/export', authMiddleware, statsController.exportExcel);
router.post('/telegram', authMiddleware, statsController.sendToTelegram);

module.exports = router;
