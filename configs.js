const log4js = require('log4js');
const { check } = require('express-validator');
const msg = `The CORS policy for this site doesn't allow access from the specified origin.`;
const allowedOrigins = 'http://localhost:3000';

// Logger
const logger = log4js.getLogger();
if (process.env.NODE_ENV !== "prod") {
    logger.level = "DEBUG";
} else {
    logger.level = "WARN";
}

const origin = function(origin, callback) {
    if (!origin) {
        return callback(null, true);
    }
    return callback(null, true);
}

// Session-store options
const options = {
    host: 'localhost',
    user: 'root',
    password: 'kolibri',
    database: 'session',
    schema: {
        tableName: 'session',
        columnNames: {
            session_id: 'sessionID'
        }
    }
};

const validate = [check('name').matches(/^[A-Z]{1}[a-z]{1,}$/)
    .withMessage('Names first simbol must upper'),
    check('mail').isEmail().withMessage('Not valid E-mail adress.'),
    check('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(`Password must be contain at least one uppercase character,
        and lowercase character, and one symbol.`)];

const validateTable = [check('name').matches(/[a-z]{1,}$/)
.withMessage('Name must have only letters')];

// Database options
const mysqlProps = {
    host     : 'localhost',
    user     : 'root',
    password : 'kolibri',
    database : 'info'
};

module.exports = {
    secure: 'supersecretkeykolibri',
    allowedOrigins: allowedOrigins,
    validateTable: validateTable,
    mysql: require('mysql'),
    mysqlProps: mysqlProps,
    validate: validate,
    options: options,
    logger: logger,
    origin: origin,
    key: "secret",
    message: msg,
    port: 10000
};