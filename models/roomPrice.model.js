const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db.config');

const RoomPrice = sequelize.define('RoomPrice', {
    room_type: {
        type: DataTypes.ENUM('Deluxe', 'Suite'),
        allowNull: false,
    },
    date_from: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    date_to: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    price_member: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    price_non_member: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    tableName: 'room_prices',
    timestamps: false,
});

module.exports = RoomPrice;
