const configs = require('../configs');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore(configs.options);
const connection = configs.mysql.createConnection(configs.mysqlProps);
connection.connect();
configs.logger.info(`Connected with MySql database`);

module.exports = {
    connection: connection,
    sessionStore: sessionStore
};