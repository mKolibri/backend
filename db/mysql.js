const mysql = require('mysql');

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'kolibri',
    database : 'info'
});

connection.connect();

module.exports = connection;