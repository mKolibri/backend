const mysql = require('mysql');
const { check } = require('express-validator');
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'kolibri',
    database : 'info'
});

var options = {
    host: 'localhost',
    user: 'root',
    password: 'kolibri',
    database: 'session',
    schema: {
        tableName: 'sessionStore',
        columnNames: {
            session_id: 'sessionID'
        }
    },
};

module.exports.validate = [check('name').matches(/^[A-Z]{1}[a-z]{1,}$/)
    .withMessage('Names first simbol must upper'),
    check('mail').isEmail().withMessage('Not valid E-mail adress.'),
    check('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(`Password must be contain at least one uppercase character,
        and lowercase character, and one symbol.`)];

module.exports.connection = connection;
module.exports.options = options;
module.exports.secure = 'supersecretkeykolibri';
module.exports.level = "debug";
module.exports.port = 10000;