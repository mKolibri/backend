const express = require('express');
const bodyParser = require('body-parser');
const login = require('./routers/router');
const cors = require('cors');
const dotenv = require('dotenv');;
const configs = require('./configs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// database
configs.connection.connect();
configs.logger.info(`Connected with sql database`);

// Session
const app = express();
var sessionStore = new MySQLStore(configs.options);
app.use(bodyParser.urlencoded({
  extended: false
}));
app.set('trust proxy', 1);
app.use(session({
  secret: configs.secure,
  resave: true,
  store: sessionStore,
  saveUninitialized: true,
}));

// request & response
app.use(cookieParser());
dotenv.config();
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/', login);
app.use(cors({'origin' : 'localhost'}));
app.listen(configs.port);
configs.logger.info(`listening to port ${configs.port}`);
module.exports = app;