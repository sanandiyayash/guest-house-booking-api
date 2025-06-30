const jwt = require('jsonwebtoken');
const env = require('../configs/env.config');
function generateJwtToken(payload) {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: '1d' });
}
module.exports = generateJwtToken;