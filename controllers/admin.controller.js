const Room = require('../models/room.model');
const RoomPrice = require('../models/roomPrice.model');
const RoomPhoto = require('../models/roomPhoto.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const StaffUser = require('../models/staffUser.model');
const bcrypt = require('bcryptjs');
const CustomError = require('../utils/customError');

exports.createRoom = async (req, res, next) => {
    const { room_type, room_number, status, facilities } = req.body;

    if (!room_type || !room_number || !status) {
        throw new CustomError('All fields are required', 400);
    }

    try {
        const existing = await Room.findOne({ where: { room_number } });
        if (existing) {
            throw new CustomError('Room number already exists', 409);
        }
        const room = await Room.create({
            room_type,
            room_number,
            status,
            facilities
        });

        res.status(201).json({ success: true, message: 'Room created successfully', data: room });
    } catch (err) {
        console.error('createRoom error:', err);
        next(err);
    }
};

exports.updateRoom = async (req, res, next) => {
    const roomId = req.params.id;
    const { room_type, room_number, status, facilities } = req.body;

    try {
        const room = await Room.findByPk(roomId);
        if (!room) {
            throw new CustomError('Room not found', 404);
        }

        room.room_type = room_type || room.room_type;
        room.room_number = room_number || room.room_number;
        room.status = status || room.status;
        room.facilities = facilities || room.facilities;

        await room.save();

        res.status(200).json({ success: true, message: 'Room updated successfully', data: room });
    } catch (err) {
        console.error('updateRoom error:', err.message);
        next(err)
    }
};

// Delete Room
exports.deleteRoom = async (req, res, next) => {
    const roomId = req.params.id;

    try {
        const room = await Room.findByPk(roomId);
        if (!room) {
            throw new CustomError('Room not found', 404);
        }

        await room.destroy();

        res.status(200).json({ success: true, message: 'Room deleted successfully' });
    } catch (err) {
        console.error('deleteRoom error:', err);
        next(err);
    }
};

exports.setRoomPrice = async (req, res, next) => {
    const { room_type, date_from, date_to, price_member, price_non_member } = req.body;

    if (!room_type || !date_from || !date_to || !price_member || !price_non_member) {
        throw new CustomError('All fields required', 400);
    }

    try {
        const priceEntry = await RoomPrice.create({
            room_type,
            date_from,
            date_to,
            price_member,
            price_non_member
        });

        res.status(201).json({ success: true, message: 'Pricing set', data: priceEntry });
    } catch (err) {
        console.error('setRoomPrice error:', err);
        next(err);
    }
};

// Upload Room Image
exports.uploadRoomImage = async (req, res, next) => {
    const { room_id } = req.body;

    if (!req.file || !room_id) {
        throw new CustomError('All fields required', 400);
    }

    try {
        const imageUrl = `/public/uploads/rooms/${req.file.filename}`;
        const room = await Room.findByPk(room_id)
        if (!room) {
            throw new CustomError('Room not found', 404);
        }
        const image = await RoomPhoto.create({
            room_id,
            image_url: imageUrl
        });

        res.status(201).json({ success: true, message: 'Image uploaded', data: image });
    } catch (err) {
        console.error('uploadRoomImage error:', err);
        next(err)
    }
};

exports.createStaffUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        throw new CustomError('All fields required', 400);
    }

    try {
        const existing = await StaffUser.findOne({ where: { email } });
        if (existing) {
            throw new CustomError('Email already exists', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const staff = await StaffUser.create({
            name,
            email,
            password_hash: hashedPassword,
            role
        });
        const { password_hash: psd, ...otherData } = staff.toJSON();
        res.status(201).json({ success: true, message: 'Staff created', data: otherData });
    } catch (err) {
        console.error('createStaffUser error:', err);
        next(err);
    }
};

exports.listStaffUsers = async (req, res, next) => {
    try {
        const staffList = await StaffUser.findAll({
            attributes: ['id', 'name', 'email', 'role', 'created_at']
        });

        res.status(200).json({ success: true, data: staffList });
    } catch (err) {
        console.error('listStaffUsers error:', err);
        next(err);
    }
};

exports.customerHistory = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Booking.findAndCountAll({
            include: [
                {
                    model: User,
                    attributes: ['name', 'phone', 'email']
                },
                {
                    model: Room,
                    attributes: ['room_number', 'room_type']
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages,
            totalRecords: count,
            data: rows
        });
    } catch (err) {
        console.error('customerHistory error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch booking history' });
    }
};

exports.createWalkinBooking = async (req, res, next) => {
    const { name, phone, email, room_id, from_date, to_date, is_member, membership_number, payment_status, payment_mode } = req.body;

    if (!name || !phone || !room_id || !from_date || !to_date || !payment_mode || !payment_status || !req.file) {
        throw new CustomError('All fields required', 400);
    }

    try {

        let user = await User.findOne({ where: { phone } });

        if (!user) {
            user = await User.create({
                name,
                phone,
                email,
                user_type: 'customer'
            });
        }
        const idProofUrl = `/public/uploads/idproofs/${req.file.filename}`;
        const booking = await Booking.create({
            user_id: user.id,
            room_id,
            from_date,
            to_date,
            is_member,
            membership_number,
            id_proof_url: idProofUrl,
            payment_status,
            payment_mode
        });

        res.status(201).json({ success: true, message: 'Walk-in booking created', data: booking });
    } catch (err) {
        console.error('createWalkinBooking error:', err);
        next(err);
    }
};