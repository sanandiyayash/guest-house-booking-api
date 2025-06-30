const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db.config');

const Room = sequelize.define('Room', {
    room_type: {
        type: DataTypes.ENUM('Deluxe', 'Suite'),
        allowNull: false
    },
    room_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('available', 'booked'),
        defaultValue: 'available'
    },
    facilities: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'rooms',
    timestamps: true
});

module.exports = Room;