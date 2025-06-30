const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db.config');
const User = require('./user.model');
const Room = require('./room.model');

const Booking = sequelize.define('Booking', {
    from_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    to_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    is_member: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    membership_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    id_proof_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending',
    },
    payment_mode: {
        type: DataTypes.ENUM('online', 'card', 'cash'),
        allowNull: true,
    },
}, {
    tableName: 'bookings',
    timestamps: true
});

User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

Room.hasMany(Booking, { foreignKey: 'room_id' });
Booking.belongsTo(Room, { foreignKey: 'room_id' });

module.exports = Booking;