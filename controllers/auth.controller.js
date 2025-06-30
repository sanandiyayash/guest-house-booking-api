const bcrypt = require('bcryptjs');
const otpGenerator = require('../utils/jwt');
const User = require('../models/user.model');
const StaffUser = require('../models/staffUser.model');
const OtpTable = require('../models/otp.model');
const { Op } = require('sequelize');
const generateJwtToken = require('../utils/jwt');


exports.staffLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const user = await StaffUser.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        let tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        const token = generateJwtToken(tokenPayload);

        res.cookie('token', token);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.sendOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

    try {
        const otp = otpGenerator();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await OtpTable.create({ phone, otp, expires_at: expiresAt });

        // TODO : implement otp sending service
        console.log(`OTP for ${phone}: ${otp}`);

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
        console.error('sendOtp error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required' });

    try {
        const record = await OtpTable.findOne({
            where: {
                phone,
                otp,
                used: false,
                expires_at: { [Op.gt]: new Date() },
            },
        });

        if (!record) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }

        record.used = true;
        await record.save();

        let user = await User.findOne({ where: { phone } });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'NO booking found',
            });
        }
        const tokenPayload = {
            id: user.id,
            phone: user.phone,
            role: user.user_type
        }
        const token = generateJwtToken(tokenPayload);
        res.cookie('token', token)
        res.status(200).json({
            success: true,
            message: 'OTP verified',


        });
    } catch (err) {
        console.error('verifyOtp error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};