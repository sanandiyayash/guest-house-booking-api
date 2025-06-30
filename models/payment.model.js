const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db.config');
const Booking = require('./booking.model');

const Payment = sequelize.define('Payment', {
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    mode: {
        type: DataTypes.ENUM('online', 'card', 'cash'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        defaultValue: 'pending',
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'payments',
    timestamps: true,
});

Booking.hasOne(Payment, { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

module.exports = Payment;
