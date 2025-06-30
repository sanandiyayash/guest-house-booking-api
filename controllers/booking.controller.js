const { Op } = require('sequelize');
const sequelize = require('../configs/db.config');
const User = require('../models/user.model');
const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const env = require('../configs/env.config');
const Stripe = require('stripe');

exports.createBooking = async (req, res) => {
    const {
        name,
        phone,
        email,
        room_type,
        from_date,
        to_date,
        is_member,
        membership_number,
    } = req.body;
    if (!name || !phone || !room_type || !from_date || !to_date || !req.file) {
        return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }
    const idProofUrl = `/public/uploads/idproofs/${req.file.filename}`;

    try {
        let user = await User.findOne({ where: { phone } });
        if (!user) {
            user = await User.create({ name, phone, email, user_type: 'customer' });
        }

        const bookedRoomIds = await Booking.findAll({
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
                ],
                payment_status: 'success'
            },
            attributes: ['room_id']
        }).then(rows => rows.map(b => b.room_id));

        const room = await Room.findOne({
            where: {
                room_type,
                id: { [Op.notIn]: bookedRoomIds }
            }
        });

        if (!room) {
            return res.status(404).json({ success: false, message: 'No rooms available for given dates' });
        }

        const booking = await Booking.create({
            user_id: user.id,
            room_id: room.id,
            from_date,
            to_date,
            is_member,
            membership_number: is_member ? membership_number : null,
            id_proof_url: idProofUrl,
            payment_status: 'pending',
            payment_mode: null
        });

        res.status(201).json({
            success: true,
            message: 'Booking created. Proceed to payment.',
            data: booking
        });
    } catch (err) {
        console.error('createBooking error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.initiatePayment = async (req, res) => {
    const { booking_id, amount, success_url, cancel_url } = req.body;

    if (!booking_id || !amount || !success_url || !cancel_url) {
        return res.status(400).json({ success: false, message: 'Required payment details missing' });
    }

    try {
        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        const stripe = Stripe(env.stripeSecretKey);

        // Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Booking ID: ${booking.id}`
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url,
            metadata: {
                booking_id: booking.id
            }
        });

        res.status(200).json({
            success: true,
            message: 'Payment session created',
            session_url: session.url
        });

    } catch (err) {
        console.error('initiatePayment error:', err);
        res.status(500).json({ success: false, message: 'Failed to initiate payment' });
    }
};

exports.verifyPayment = async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({ success: false, message: 'Session ID required' });
    }

    try {
        const stripe = Stripe(env.stripeSecretKey);
        // Fetch session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Payment not successful' });
        }

        const bookingId = session.metadata.booking_id;

        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Save payment to DB
        await Payment.create({
            booking_id: bookingId,
            amount: session.amount_total / 100,
            mode: session.payment_method_types[0],
            status: session.payment_status,
            transaction_id: session.payment_intent
        });

        // Update booking status
        booking.payment_status = 'success';
        booking.payment_mode = session.payment_method_types[0];
        await booking.save();

        res.status(200).json({ success: true, message: 'Payment verified successfully' });

    } catch (err) {
        console.error('verifyPayment error:', err);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};

exports.getBookingHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await Booking.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Room,
                    as: 'Room',
                    attributes: ['room_number', 'room_type', 'facilities']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        console.error('getBookingHistory error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};