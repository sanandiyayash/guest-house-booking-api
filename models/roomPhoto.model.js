const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db.config');
const Room = require('./room.model');

const RoomPhoto = sequelize.define('RoomPhoto', {
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'room_photos',
    timestamps: true,
});

Room.hasMany(RoomPhoto, { foreignKey: 'room_id' });
RoomPhoto.belongsTo(Room, { foreignKey: 'room_id' });

module.exports = RoomPhoto;
