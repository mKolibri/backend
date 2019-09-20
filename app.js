const express = require('express');
const bodyParser = require('body-parser');
const login = require('./routers/user.router');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', login);
app.use(cors('*'));

app.listen(10000);
console.log("Listenning to port 10000", {useNewUrlParser: true});

module.exports = app;