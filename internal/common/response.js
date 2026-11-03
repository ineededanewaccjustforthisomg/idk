const Responses = require('../common/util/Responses');

module.exports = function attachResponses(req, res, next) {
    res.api = Responses;
    next();
};