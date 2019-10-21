const express = require('express');
const bodyParser = require('body-parser');
const login = require('./routers/user.router');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const port = require('./configs');
const Token = require('./token.controller');

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

app.use(Token.checkToken, request.query.userID, req.query.token); // ?

app.use('/', login);
app.use(cors('*'));
app.listen(port);

module.exports = app;