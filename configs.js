const mysql = require('mysql');

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'kolibri',
    database : 'info'
});

connection.connect();
export const ;

module.exports.connection = connection;
module.exports.port = 10000;