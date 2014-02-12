// web.js
var pg = require('pg');

var express = require("express");
var logfmt = require("logfmt");
var app = express();

pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  client.query('SELECT * FROM your_table', function(err, result) {
    done();
    if(err) return console.error(err);
    console.log(result.rows);
  });
});


app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send("this is get request");
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});





