const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db.config');

const StaffUser = sequelize.define('StaffUser', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,

    },

    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    role: {
        type: DataTypes.ENUM("staff", "admin"),
        allowNull: false,
        defaultValue: 'staff',
    },
}, {
    tableName: 'staff_users',
    timestamps: true,
});

module.exports = StaffUser;
