var express = require("express");
var logfmt = require("logfmt");
var app = express();
var pg = require('pg');
var assert = require('assert');
var myUsers = new UsersModel();
var async = require('async');

function TestUsers(){
  //UnitTest!!!!
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

function UsersModel(){
    var self = this;
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
    function login(user,password, callback){
        var row_count = 0;
        var update_query;
        var jsonObject = {};
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            var query = client.query('Select * from login_info where username=\''+user+'\' AND password=\''+password+'\';', function(err, result) {
                done();
                if(err) return console.error(err);
                row_count = result.rows.length;
                if (row_count<1) {
                    if(callback){
                        jsonObject.errCode = self.ERR_BAD_CREDENTIALS;
                        callback(jsonObject);
                        return;
                    }
                    //return UsersModel.ERR_BAD_CREDENTIALS;
                }
                console.log(result.rows[0].count);
                console.log("hit_count is %d",hit_count);
                console.log('the second query is UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+user+'\' AND password=\''+password+'\';');
                client.query('UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+user+'\' AND password=\''+password+'\';', function(err, result) {
                    done();
                    if(err) return console.error(err);
                    if(callback){
                        jsonObject.errCode = self.SUCCESS;
                        jsonObject.count = row_count;
                        callback(jsonObject);
                        return;
                    }
                    //return row_count;
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
    function add(user,password, callback){
        var jsonObject = {};
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(user == ""){
                if(callback){
                    jsonObject.errCode = self.ERR_BAD_USERNAME;
                    callback(jsonObject);
                    return;
                }
            }
            
            console.log('SELECT * FROM login_info WHERE username=\''+user+'\' AND password=\'' + password+'\';');
            client.query('SELECT * FROM login_info WHERE username=\''+user+'\' AND password=\'' + password+'\';', function(err, result){
                done();
                if(err) return console.error(err);
                if(result.rows.length > 0){
                    if(callback){
                        jsonObject.errCode = self.ERR_BAD_USER_EXISTS;
                        callback(jsonObject);
                        return;
                    }
                }
                else{
                    console.log("INSERT INTO login_info (username, password, count) VALUES (\'"+user+"\', \'"+password+"\',1);");
                    client.query("INSERT INTO login_info (username, password, count) VALUES (\'"+user+"\', \'"+password+"\',1);");
                    if(callback){
                        jsonObject.errCode = self.SUCCESS;
                        jsonObject.count = 1;
                        callback(jsonObject);
                        return;
                    }
                }
            });
            
        });
    }
    
    /*
    This function tests our api UNIT TESTS
    deletes all entries from login info table
    */
    function TESTAPI_resetFixture(callback){
        var jsonObject = {};
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query('DELETE from login_info', function(err, result) {
                done();
                if(err) return console.error(err);
                
                if(callback){
                    jsonObject.errCode = self.SUCCESS;
                    callback(jsonObject);
                    return;
                }
                
            });
        });
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
  res.write('<html><body>'+body+'<br>');
  res.write('<form action="login" method="post">Username <input type="text" name="username"><br>Password <input type="text" name="password"><input type="submit" value="Login" onclick=this.form.action="users/login"><input type="submit" value="add" onclick=this.form.action="users/add"><input type="submit" value="resetFixture" onclick=this.form.action="TESTAPI/resetFixture"><input type="submit" value="unitTests" onclick=this.form.action="TESTAPI/unitTests">');
  res.end('</form></body></html>');
});

app.post('users/add', function(req, res) {
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
        return;
    });
});

app.post('/TESTAPI/unitTests', function(req, res) {
    var framework = new TestUsers();
    //framework.setup();
    //framework.testAdd1();
    //framework.testAddExists();
    //framework.testAdd2();
    //framework.testAddEmptyUsername();
    var jsonObject = {};
    jsonObject.nrFailed = 0;
    jsonObject.output = "hi";
    jsonObject.totalTests = 10;
    
    res.set({'Content-Type': 'application/json'})
    res.end(JSON.stringify(jsonObject));
    return;
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
