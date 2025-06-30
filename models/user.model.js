const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db.config');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_type: {
        type: DataTypes.ENUM('admin', 'staff', 'customer'),
    },

}, {
    tableName: 'users',
    timestamps: true
});
module.exports = User;