const { Op } = require('sequelize');
const Room = require('../models/room.model');
const RoomPrice = require('../models/roomPrice.model');
const Booking = require('../models/booking.model');
const sequelize = require('../configs/db.config');

exports.getRoomTypes = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const prices = await RoomPrice.findAll({
            where: {
                date_from: { [Op.lte]: today },
                date_to: { [Op.gte]: today },
            },
            order: [['room_type', 'ASC']]
        });

        const result = prices.map(p => ({
            room_type: p.room_type,
            price_member: p.price_member,
            price_non_member: p.price_non_member,
        }));

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('Error in getRoomTypes:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 2. POST /api/rooms/availability
exports.checkAvailability = async (req, res) => {
    const { from_date, to_date } = req.body;
    if (!from_date || !to_date) {
        return res.status(400).json({ success: false, message: 'Date range required' });
    }

    try {
        // Find booked room_ids in date range
        const bookedRooms = await Booking.findAll({
            attributes: ['room_id'],
            where: {
                [Op.or]: [
                    {
                        from_date: { [Op.between]: [from_date, to_date] }
                    },
                    {
                        to_date: { [Op.between]: [from_date, to_date] }
                    },
                    {
                        from_date: { [Op.lte]: from_date },
                        to_date: { [Op.gte]: to_date }
                    }
                ]
            }
        });

        const bookedIds = bookedRooms.map(b => b.room_id);

        const availableRooms = await Room.findAll({
            where: {
                id: { [Op.notIn]: bookedIds }
            }
        });

        res.status(200).json({ success: true, data: availableRooms });
    } catch (err) {
        console.error('Error in checkAvailability:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.checkPastBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await Booking.findAll({
            where: { user_id: userId },
            include: ['Room']
        });

        if (!bookings.length) {
            return res.status(404).json({ success: false, message: 'No bookings found' });
        }

        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        console.error('Error in checkPastBookings:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.getFacilities = async (req, res) => {
    try {
        const rooms = await Room.findAll({
            attributes: ['facilities']
        });

        const allFacilities = new Set();
        rooms.forEach(room => {
            if (room.facilities) {
                room.facilities.split(',').forEach(f => allFacilities.add(f.trim()));
            }
        });

        res.status(200).json({ success: true, data: Array.from(allFacilities) });
    } catch (err) {
        console.error('Error in getFacilities:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
