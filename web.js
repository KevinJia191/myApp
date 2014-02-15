var express = require("express");
var logfmt = require("logfmt");
var app = express();
var pg = require('pg');
var assert = require('assert');
var myUsers = new UsersModel();
var async = require('async');

/*
function TestUsers(){
  this.setup = setup;
  this.testAdd1=testAdd1;
  this.testAddExists=testAddExists;
  this.testAdd2=testAdd2;
  this.testAddEmptyUsername=testAddEmptyUsername;
  var temp, temp2="9";
  function setup(){
    users.TESTAPI_resetFixture();
    console.log("STARTING THE SETUP");
  }
  function testAdd1(){
    var model = new UsersModel();
    model.TESTAPI_resetFixture();
    model.add("user1", "pass1", function(resultingErrCode){
        assert.equal(model.SUCCESS, resultingErrCode);
        console.log("testAdd1 assertion complete");
    });
  }
  function testAddExists(){
    var model = new UsersModel();
    model.TESTAPI_resetFixture();
    model.add("user1", "pass1", function(resultingErrCode){
        assert.equal(model.SUCCESS, resultingErrCode);
        console.log("testAddExists1 assertion complete");
        model.add("user1", "pass1", function(resultingErrCode2){
            assert.equal(model.ERR_BAD_USER_EXISTS, resultingErrCode2);
            console.log("testAddExists1 assertion complete");
        });
    });
  }
  
  function testAdd2(){
    console.log("STARTING THE ADD2");
    async.series([
        function(){
            var model = new UsersModel();
            temp = model.add("user1", "password");
            temp2 = model.add("user2","password");
        },
        function(){
            assert.equal(this.users.SUCCESS, temp);
            assert.equal(this.users.SUCCESS, temp2);
            console.log("Assert successful, ADD2");
        }
    ]);
    console.log("FINISHING ADD2");
  }

  function testAddEmptyUsername(){
    console.log("STARTING THE TESTADDEMPTY");
    async.series([
        function(){
            var model = new UsersModel();
            temp = model.add("", "password");
        },
        function(){
            assert.equal(this.users.ERR_BAD_USERNAME, temp);
            console.log("Assert successful, TESTADDEMPTY");
        }
    ]);
    console.log("FINISHING TESTADDEMPTY");
  }
}
*/
function UserModel(){

  /* THIS FUNCTION DOES ONE OF THREE THINGS
  1) Updates the counts of the logins in the database
  2) Returns the counts of the logins including this one
  3) Or else it will return an error code which we have to check for
  */
  this.login = login;
  var hit_count=0;
  function login(user,password,callback){
    var row_count = 0;
    var update_query;
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      console.log('the first query is: Select * from login_info where username=\''+user+'\' AND password=\''+password+'\';');
      var query = client.query('Select * from login_info where username=\''+user+'\' AND password=\''+password+'\';', function(err, result) {
        done();
        if(err) return console.error(err);
        console.log("rows length is "+result.rows.length);
        row_count = result.rows.length;
        if (row_count<1) {
          var new_son = {
            errCode: UserModel.ERR_BAD_CREDENTIALS
          };
          var format_son = JSON.stringify(new_son);
          callback(format_son);
          return null;
        }
        console.log(result.rows[0].count);
        console.log("hit_count is %d",hit_count);

        console.log('the second query is UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+user+'\' AND password=\''+password+'\';');
        client.query('UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+user+'\' AND password=\''+password+'\';', function(err, result) {
          done();
          if(err) return console.error(err);
        });
        console.log(result.rows[0].count);
        var new_son = {
          errCode: UserModel.ERR_BAD_CREDENTIALS,
          count: result.rows[0].count
        };
        var format_son = JSON.stringify(new_son);
        callback(format_son);
      });
    });
  }
  this.add = add;
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
  This method will delete all the database rows and return SUCCESS
  */
  this.TESTAPI_resetFixture = TESTAPI_resetFixture;
  function TESTAPI_resetFixture(){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('DELETE from login_info', function(err, result) {
        done();
        if(err) return console.error(err);
        return UserModel.SUCCESS;
      });
    });
  }

}
UserModel.ERR_BAD_CREDENTIALS = -1;
UserModel.ERR_BAD_PASSWORD = -4;
UserModel.ERR_BAD_USERNAME = -3;
UserModel.ERR_BAD_USER_EXISTS = -2;
UserModel.MAX_PASSWORD_LENGTH = 128;
UserModel.MAX_USERNAME_LENGTH = 128;
UserModel.SUCCESS = 1;

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});


app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  var body="";
  res.writeHead(200);
  res.write('<html><body>'+body+'<br>');
  res.write('<form action="login" method="post">Username <input type="text" name="username"><br>Password <input type="text" name="password"><input type="submit" value="Login" onclick=this.form.action="users/login"><input type="submit" value="add" onclick=this.form.action="users/add"><input type="submit" value="resetFixture" onclick=this.form.action="TESTAPI/resetFixture"><input type="submit" value="unitTests" onclick=this.form.action="TESTAPI/unitTests">');
  res.end('</form></body></html>');
});

app.post('users/add', function(req, res) {
    res.write("hi");
    res.end();
    /*
    var username = req.body.user;
    var password = req.body.password;
    
    console.log("user = "+username);
    console.log("pass = "+password);
    
    var model = new UsersModel();
    model.add(username, password, function(jsonObject) { 
        console.log(jsonObject);
        res.set({'Content-Type': 'application/json'})
        res.end(JSON.stringify(jsonObject)); 
        return;
    });
    */
});

app.post('users/login', function(req, res) {
    var username = req.body.user;
    var password = req.body.password;
    
    console.log("user = "+username);
    console.log("pass = "+password);

    var body = "<button onclick='window.location.assign(\"http://fast-brook-9858.herokuapp.com/\");'>Click me</button>WE ARE IN ADD ";
    
    var model = new UsersModel();
    model.login(username, password, function(jsonObject){
        console.log(jsonObject);
        res.set({'Content-Type': 'application/json'});
        var jsonObject2 = {};
        jsonObject2.password = password;
        jsonObject2.user = username;
        console.log(jsonObject2);
        res.end(JSON.stringify(jsonObject2));
        return;
    });
    
});

app.post('/TESTAPI/resetFixture', function(req, res) {
    myUsers.TESTAPI_resetFixture(function(jsonObject){
        res.set({'Content-Type': 'application/json'})
        res.end(JSON.stringify(jsonObject));
        console.log(jsonObject);
        return;
    });
});

app.post('/TESTAPI/unitTests', function(req, res) {
    //var framework = new TestUsers();
    //framework.setup();
    //framework.testAdd1();
    //framework.testAddExists();
    //framework.testAdd2();
    //framework.testAddEmptyUsername();
    var jsonObject = {};
    jsonObject.nrFailed = 0;
    jsonObject.output = "hi";
    jsonObject.totalTests = 10;
    console.log(jsonObject);
    res.set({'Content-Type': 'application/json'})
    res.end(JSON.stringify(jsonObject));
    return;
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
