const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.get('/rooms/types', publicController.getRoomTypes);
router.get('/rooms/facilities', publicController.getFacilities);
router.post('/rooms/availability', publicController.checkAvailability);
router.post('/bookings/check', publicController.checkPastBookings);

module.exports = router;
