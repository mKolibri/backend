const express = require('express');
const bodyParser = require('body-parser');
const login = require('./routers/user.router');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const config = require('./configs');
var cookieParser = require('cookie-parser');
const Token = require('./token.controller');
var app = express();

app.use(cookieParser());
app.listen(8080);
app.use(cors({
  origin: (_origin, callback) => {
      callback(null, true)
  },
  credentials: true
}))

dotenv.config();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(Token.checkToken, request.cookies.userID, req.cookies.token); // ?
app.use('/', login);
// app.use(cors('*'));
app.listen(config.port);

module.exports = app;