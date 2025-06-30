require('dotenv').config();

const env = {
    port: process.env.PORT || 5000,
    isInDevlopment: process.env.NODE !== "production" || !process.env.NODE,
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
    },
    jwtSecret: process.env.JWT_SECRET,
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
};

module.exports = env;
