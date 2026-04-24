const passthrough = (req, res, next) => next();

module.exports = { validateProblem: passthrough };

