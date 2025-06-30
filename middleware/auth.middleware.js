const jwt = require('jsonwebtoken');
const env = require('../configs/env.config');

module.exports = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
