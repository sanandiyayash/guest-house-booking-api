const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const getMulterUpload = require('../utils/multer');
const bookingUpload = getMulterUpload('idpoofs');

router.post('/bookings/create', bookingUpload.single('id_proof_url'), bookingController.createBooking);
router.post('/payments/initiate', bookingController.initiatePayment);
router.post('/payments/verify', bookingController.verifyPayment);
router.get('/bookings/history', authMiddleware, bookingController.getBookingHistory);

module.exports = router;
