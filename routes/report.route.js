const express = require('express');
const router = express.Router();
const adminController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/reports/revenue', authMiddleware, adminController.revenueReport);
router.get('/reports/frequent-customers', authMiddleware, adminController.frequentCustomers);

module.exports = router;