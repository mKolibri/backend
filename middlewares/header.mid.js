const configs = require('../configs');

module.exports = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', configs.allowedOrigins);
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}