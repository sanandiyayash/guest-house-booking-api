const { Sequelize } = require('sequelize');
const env = require('./env.config');

const sequelize = new Sequelize(
    env.db.name,
    env.db.user,
    env.db.password,
    {
        host: env.db.host,
        dialect: "mysql",
        logging: !env.isInDevlopment,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
        },
    }
);

module.exports = sequelize;