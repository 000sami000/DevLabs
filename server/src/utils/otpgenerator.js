 
const jwt = require('jsonwebtoken');

module.exports = generateOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const token = jwt.sign({ email,otp }, process.env.JWT_SECRET, { expiresIn: '10m' }); // OTP valid for 10 minutes
  return { otp, token };
};