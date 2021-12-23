const configs = require('../configs');

const isLoggedIn = function(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        configs.logger.error(`session error`);
        return res.status(400).json({
            message: "Empty data, the server did not understand the request"
        });
    }
};

const isSessionExist = function(req, res, next) {
    if (req.cookies && !req.session) {
      res.clearCookie(req.sessionID);
    }
    next();
}

module.exports = {
    isLoggedIn: isLoggedIn,
    isSessionExist: isSessionExist
};