const passthrough = (req, res, next) => next();

module.exports = {
  validateSignin: passthrough,
  validateSignup: passthrough,
  validatePasswordReset: passthrough,
};
