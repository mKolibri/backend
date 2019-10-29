const mysql = require('mysql');
const { check } = require('express-validator');
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'kolibri',
    database : 'info'
});
connection.connect();

module.exports.validate = [check('name').matches(/^[A-Z]{1}[a-z]{1,}$/)
    .withMessage('Names first simbol must upper'),
    check('mail').isEmail().withMessage('Not valid E-mail adress.'),
    check('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(`Password must be contain at least one uppercase character,
        and lowercase character, and one symbol.`)];

module.exports.getValues = (columns) => {
    let values = "( ";
    if (columns.length <= 0) {
        values = "";
    } else {
        for ( let i = 0; i < columns.length; ++i ) {
            values += columns[i].column + " " + columns[i].type + ",";
        }
        values = values.substring(0, values.length - 1);
        values += ")";
    }
    return values;
}

module.exports.connection = connection;
module.exports.port = 10000;