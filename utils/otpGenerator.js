const otpGenerator = require('otp-generator');

function generateOtp(length = 6) {
    return otpGenerator.generate(length, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });
}
module.exports = generateOtp;

