const errorHandler = (err, req, res, next) => {
    if (err.name?.startsWith('Sequelize')) {
        const errorItem = err.errors?.[0];
        return res.status(400).json({
            success: false,
            message: errorItem?.message || 'Sequelize validation error',
            field: errorItem?.path || undefined
        });
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
}

module.exports = errorHandler;