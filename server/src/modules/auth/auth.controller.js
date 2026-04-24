const userController = require("../user/user.controller");

module.exports = {
  signin: userController.signin,
  signup: userController.signup,
  signout: userController.signout,
  verify_user_email: userController.verify_user_email,
  verify_otp: userController.verify_otp,
  reset_forgotten_password: userController.reset_forgotten_password,
};
