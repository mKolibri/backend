const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const express = require('express');
const database = require('./database/db');
const configs = require('./configs');
const headers = require('./middlewares/header.mid');
const router = require('./routers/router');

// SessionStore
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Headers
app.use(headers);

// Session and cookies
app.use("/", session({
  secret: configs.secure,
  key: configs.key,
  resave: true,
  store: database.sessionStore,
  saveUninitialized: true,
  cookie: {
    expires: 60000000,
  }
}));

// cors
app.use(cors({
  origin: configs.origin
}));

app.use('/', router);
app.listen(configs.port);
configs.logger.info(`listening to port ${configs.port}`);

module.exports = app;