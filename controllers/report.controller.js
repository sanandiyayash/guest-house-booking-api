const { Op, fn, col, literal } = require('sequelize');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');

exports.revenueReport = async (req, res) => {
    const { from, to } = req.query;

    try {
        if (req.user.role === 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        const whereClause = {};
        if (from && to) {
            whereClause.created_at = { [Op.between]: [new Date(from), new Date(to)] };
        }

        const totalRevenue = await Payment.sum('amount', { where: whereClause });

        const bookingsCount = await Booking.count({ where: whereClause });

        res.status(200).json({
            success: true,
            totalRevenue: totalRevenue || 0,
            totalBookings: bookingsCount
        });
    } catch (err) {
        console.error('revenueReport error:', err);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
};

exports.frequentCustomers = async (req, res) => {
    try {
        if (req.user.role === 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        const customers = await Booking.findAll({
            attributes: [
                'user_id',
                [fn('COUNT', col('Booking.id')), 'booking_count']
            ],
            include: [
                {
                    model: User,
                    attributes: ['name', 'email', 'phone']
                }
            ],
            group: ['user_id', 'User.id'],
            having: literal('COUNT(Booking.id) > 1'),
            order: [[literal('booking_count'), 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: customers
        });
    } catch (err) {
        console.error('frequentCustomers error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch frequent customers' });
    }
};
