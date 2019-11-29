const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const express = require('express');
const cors = require('cors');
const database = require('./database/db');
const configs = require('./configs');
const login = require('./routers/router');

// SessionStore
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Headers
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', configs.allowedOrigins);
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Session and cookies
app.use(session({
  secret: configs.secure,
  key: configs.key,
  resave: true,
  store: database.sessionStore,
  saveUninitialized: true,
  cookie: {
    expires: 6000000,
  }
}));
app.use((req, res, next) => {
  if (req.cookies && !req.session) {
    res.clearCookie(req.sessionID);
  }
  next();
});

// cors
app.use(cors({
  origin: configs.origin
}));

app.use('/', login);
app.listen(configs.port);
configs.logger.info(`listening to port ${configs.port}`);

module.exports = app;