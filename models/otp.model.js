const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db.config');

const Otp = sequelize.define('Otp', {
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'otp_store',
    timestamps: true,
});

module.exports = Otp;
