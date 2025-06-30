const adminOnly = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }

        next();
    } catch (err) {
        console.error('adminOnly middleware error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error in adminOnly middleware'
        });
    }
};

module.exports = adminOnly;