const jwt = require("jsonwebtoken");
const env = require("../config/env");

const isAuthorize = async (req, res, next) => {
  const { access_token, forgot_password_token } = req.cookies;

  try {
    if (access_token) {
      const decoded = jwt.verify(access_token, env.jwtSecret);
      req.USER_ID = decoded.id;
      req.USER_ROLE = decoded.role;
    }

    if (forgot_password_token) {
      const decoded = jwt.verify(forgot_password_token, env.jwtSecret);
      req.forgot_email = decoded.email;
      req.verifying_otp = decoded.otp;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorize access" });
  }
};

module.exports = { isAuthorize };
