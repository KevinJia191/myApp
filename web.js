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

    var hit_count=0;
    function login(user,password){
        var row_count = 0;
        var update_query;
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            var query = client.query('Select * from login_info where username=\''+user+'\' AND password=\''+password+'\';', function(err, result) {
                done();
                if(err) return console.error(err);
                console.log("rows length is "+result.rows.length);
                row_count = result.rows.length;
                if (row_count<1) {
                    return UserModel.ERR_BAD_CREDENTIALS;
                }
                console.log(result.rows[0].count);
                console.log("hit_count is %d",hit_count);
                console.log('the second query is UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+user+'\' AND password=\''+password+'\';');
                client.query('UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+user+'\' AND password=\''+password+'\';', function(err, result) {
                    done();
                    if(err) return console.error(err);
                    return row_count;
                });
            });
        });
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
            
            console.log('SELECT * FROM login_info WHERE username=\''+user+'\' AND password=\'' + password+'\';');
            client.query('SELECT * FROM login_info WHERE username=\''+user+'\' AND password=\'' + password+'\';', function(err, result){
                done();
                if(err) return console.error(err);
                console.log(result);
                if(result.rows.length > 0){
                    console.log("tried to add already existing user");
                    return this.ERR_BAD_USER_EXISTS;
                }
                else{
                    console.log("INSERT INTO login_info (username, password, count) VALUES (\'"+user+"\', \'"+password+"\',1);");
                    client.query("INSERT INTO login_info (username, password, count) VALUES (\'"+user+"\', \'"+password+"\',1);");
                    return this.SUCCESS;
                }
            });
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
  res.end('<form action="signup" method="post">Username <input type="text" name="username"><br>Password <input type="text" name="password"><input type="submit" value="Login" onclick=this.form.action="signup"><input type="submit" value="add" onclick=this.form.action="add"></form></body></html>');
});

app.post('/signup', function(req, res) {
    
    
    var username = req.body.username;
    var password = req.body.password;
    
    console.log("user="+username);
    console.log("pass="+password);

    var body = "<button onclick='window.location.assign(\"http://fast-brook-9858.herokuapp.com/\");'>Click me</button>WE ARE IN SIGNUP";
    
    var model = new userModel();
    var temp = model.add(username, password);
    
    console.log("temp is " + temp);
    console.log("error code is " + model.ERR_BAD_USER_EXISTS);
    
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

app.post('/add', function(req, res) {
    
    
    var username = req.body.username;
    var password = req.body.password;
    
    console.log("user="+username);
    console.log("pass="+password);

    var body = "<button onclick='window.location.assign(\"http://fast-brook-9858.herokuapp.com/\");'>Click me</button>WE ARE IN ADD ";
    
    var model = new userModel();
    var temp = model.add(username, password);
    
    console.log("temp is " + temp);
    console.log("error code is " + model.ERR_BAD_USER_EXISTS);
    
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

