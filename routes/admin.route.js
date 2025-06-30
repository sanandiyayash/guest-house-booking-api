const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/adminAccess.middleware');
const adminController = require('../controllers/admin.controller');
const getMulterUpload = require('../utils/multer');
const roomUpload = getMulterUpload('rooms');
const bookingUpload = getMulterUpload('idpoofs');

router.post('/rooms/create', authMiddleware, adminOnly, adminController.createRoom);
router.put('/rooms/update/:id', authMiddleware, adminOnly, adminController.updateRoom);
router.delete('/rooms/delete/:id', authMiddleware, adminOnly, adminController.deleteRoom);
router.post('/rooms/set-price', authMiddleware, adminOnly, adminController.setRoomPrice);
router.post('/rooms/upload-image', authMiddleware, adminOnly, roomUpload.single('image_url'), adminController.uploadRoomImage);
router.post('/users/create-staff', authMiddleware, adminOnly, adminController.createStaffUser);
router.get('/users/list', authMiddleware, adminOnly, adminController.listStaffUsers);
router.post('/bookings/create-walkin', authMiddleware, adminOnly, bookingUpload.single('id_proof_url'), adminController.createWalkinBooking);
router.get('/customers/history', authMiddleware, adminOnly, adminController.customerHistory);

module.exports = router;
