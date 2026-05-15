const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', upload.single('receipt'), bookingController.createBooking);
router.get('/', authMiddleware, bookingController.getBookings);
router.get('/check', bookingController.checkBooking);
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus);
router.post('/report', authMiddleware, bookingController.sendReport);
router.delete('/clear', authMiddleware, bookingController.clearBookings);

module.exports = router;
