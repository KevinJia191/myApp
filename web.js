var express = require("express");
var logfmt = require("logfmt");
var app = express();
var pg = require('pg');


function userModel(){
    
    this.ERR_BAD_CREDENTIALS = -1;
    this.ERR_BAD_USER_EXISTS = -2;
    this.ERR_BAD_USERNAME = -3;
    this.ERR_BAD_PASSWORD = -4;
    this.MAX_PASSWORD_LENGTH = 128;
    this.MAX_USERNAME_LENGTH = 128;
    this.SUCCESS = 1;
    this.login = login;
    this.add = add;
    this.TESTAPI_resetFixture = TESTAPI_resetFixture;


  /* THIS FUNCTION DOES ONE OF THREE THINGS
  1) Updates the counts of the logins in the database
  2) Returns the counts of the logins including this one
  3) Or else it will return an error code which we have to check for
  */
  function login(user,password){

  }
  
    /*
    This function checks that the user does not exists, the user name is not empty.
    (the password may be empty). If user does not exist, insert into db with a count of 1
    @params
    user: (string) the username
    password: (string) the password
    */
    function add(user,password){
        
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(user == ""){
                console.log("got a username thats an empty string");
                return this.ERR_BAD_USERNAME;
            }
            
            var currCounter = client.query("SELECT count FROM login_info WHERE username=$1, password=$2", [user, password]);
            console.log("this is currCounter: " + currCounter);
            
            if(currCounter > 0){
                console.log("got a user already existing");
                return this.ERR_BAD_USER_EXISTS;
            }
            else{
                client.query("INSERT INTO login_info (username, password, count) VALUES ($1, $2, $3)", [user, password, 1]);
                console.log("just inserted" + user + ", " + password + ", 1 into login_info");
                return this.SUCCESS;
            }
        
        });
    }
    
    /*
    This function tests our api UNIT TESTS
    deletes all entries from login info table
    */
    function TESTAPI_resetFixture(){
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query("DELETE * FROM login_info;");
        });
        console.log("just deleted all entries in login info table");
        return this.SUCCESS;
    }

}

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});


app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  var body="";
  res.writeHead(200);
  res.write('<html><body>'+body+'<br>')
  res.end('<form action="signup" method="post">Username <input type="text" name="username"><br>Password <input type="text" name="password"><input type="submit" value="Submit"></form></body></html>');
});



app.post('/signup', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    console.log("user="+username);
    console.log("pass="+password);
    var body = "<button onclick='window.location.assign(\'http://fast-brook-9858.herokuapp.com/signup\')'>Click me</button>";

    var model = new userModel();
    var temp = model.add(username, password);
    
    if(temp == model.ERR_BAD_USERNAME){
        res.write(body);
        res.end("yo your username is blank, :" + username);
    }
    if(temp == model.ERR_BAD_USER_EXISTS){
        res.write(body);
        res.end("We've seen you before," + username);
    }
    else{
        res.write(body);
        res.end("first time seeing you, " + username);
    }

});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});