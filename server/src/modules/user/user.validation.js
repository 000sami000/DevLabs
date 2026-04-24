const passthrough = (req, res, next) => next();

module.exports = {
  validateProfileUpdate: passthrough,
  validatePasswordChange: passthrough,
};
