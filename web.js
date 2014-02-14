// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();


var SUCCESS               =   1
var ERR_BAD_CREDENTIALS   =  -1
var ERR_USER_EXISTS       =  -2
var ERR_BAD_USERNAME      =  -3
var ERR_BAD_PASSWORD      =  -4
var MAX_USERNAME_LENGTH = 128
var MAX_PASSWORD_LENGTH = 128

app.use(logfmt.requestLogger());

app.get("/", function(req,res) {
    res.set('Content-Type': 'text/plain');
    res.end("Hi ");
});

app.get("/users/login", function(req, res) {
    res.set('Content-Type': 'text/plain');
    res.end("swag");
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});