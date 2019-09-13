const express = require('express');
const bodyParser = require('body-parser');
const users = require('./routers/user.router');
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next();
});

app.use('/', users);
app.listen(3001);
console.log("Listenning to port 3001");

module.exports = app;