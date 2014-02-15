var express = require("express");
var logfmt = require("logfmt");
var app = express();
var pg = require('pg');
var assert = require('assert');
var async = require('async');

function TestUsers(){
  this.setup = setup;
  this.testAdd1=testAdd1;
  this.testAddExists=testAddExists;
  this.testAdd2=testAdd2;
  this.testAddEmptyUsername=testAddEmptyUsername;
  var temp, temp2;
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
    /*
    var self = this;
    this.ERR_BAD_CREDENTIALS = -1;
    this.ERR_BAD_USER_EXISTS = -2;
    this.ERR_BAD_USERNAME = -3;
    this.ERR_BAD_PASSWORD = -4;
    this.MAX_PASSWORD_LENGTH = 128;
    this.MAX_USERNAME_LENGTH = 128;
    this.SUCCESS = 1;
    */
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
                    jsonObject = {'errCode' : UsersModel.ERR_BAD_CREDENTIALS};
                    callback(jsonObject);
                    return null;
                    
                    //return UsersModel.ERR_BAD_CREDENTIALS;
                }
                console.log(result.rows[0].count);
                console.log("hit_count is %d",hit_count);
                console.log('the second query is UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+user+'\' AND password=\''+password+'\';');
                client.query('UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+user+'\' AND password=\''+password+'\';', function(err, result) {
                    done();
                    if(err) return console.error(err);
                        jsonObject = {
                            'errCode' : UsersModel.SUCCESS,
                            'count' : row_count};
                        callback(jsonObject);
                        return null;
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
        var jsonObject;
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            if(user == ""){
                jsonObject = {'errCode' : UsersModel.ERR_BAD_USERNAME};
                callback(jsonObject);
                return;                
            }
            console.log('SELECT * FROM login_info WHERE username=\''+user+'\' AND password=\'' + password+'\';');
            client.query('SELECT * FROM login_info WHERE username=\''+user+'\' AND password=\'' + password+'\';', function(err, result){
                done();
                if(err) return console.error(err);
                if(result.rows.length > 0){
                    jsonObject ={'errCode' : UsersModel.ERR_BAD_USER_EXISTS};
                    callback(jsonObject);
                    return;
                }
                else{
                    console.log("INSERT INTO login_info (username, password, count) VALUES (\'"+user+"\', \'"+password+"\',1);");
                    client.query("INSERT INTO login_info (username, password, count) VALUES (\'"+user+"\', \'"+password+"\',1);");
                    jsonObject ={'errCode' : UsersModel.SUCCESS, count : 1};
                    callback(jsonObject);
                    return;
                    
                }
            });
            
        });
    }
    
    /*
    This function tests our api UNIT TESTS
    deletes all entries from login info table
    */
    function TESTAPI_resetFixture(callback){
        var jsonObject;
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query('DELETE from login_info', function(err, result) {
                done();
                if(err) return console.error(err);
                
                if(callback){
                    jsonObject = {'errCode' : UsersModel.SUCCESS};
                    callback(jsonObject);
                    return;
                }
                
            });
        });
    }
}
UsersModel.ERR_BAD_CREDENTIALS = -1;
UsersModel.ERR_BAD_PASSWORD = -4;
UsersModel.ERR_BAD_USERNAME = -3;
UsersModel.ERR_BAD_USER_EXISTS = -2;
UsersModel.MAX_PASSWORD_LENGTH = 128;
UsersModel.MAX_USERNAME_LENGTH = 128;
UsersModel.SUCCESS = 1;
var myUser = new UsersModel();

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});


app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  var body="";
  //res.write('Goodbye World!');
  
  //res.send('How fancy can we get with this?');
  res.writeHead(200);
  res.write('<html><body>'+body+'<br>')
  res.write('<form action="TESTAPI/unitTests" method="post"><input type="submit" value="UnitTest"></form><form action="TESTAPI/resetFixture" method="post"><input type="submit" value="resetBase"></form>');
  res.end('<form action="signup" method="post">Username <input type="text" name="user"><br>Password <input type="text" name="password"><input type="submit" value="Login" onclick=this.form.action="users/login"><input type="submit" value="add" onclick=this.form.action="users/add"></form></body></html>');
  //WE SHOULD USE POST INSTEAD 
});

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});


app.post('/users/login', function(req, res) {
    //console.log(req.body);
    res.header('Content-Type', 'application/json');
    //res.write("<html><body>")
    var body = "<button onclick='window.location.assign(\"http://radiant-temple-1017.herokuapp.com/\");'>Click me</button>";
    var username = req.body.user;
    var password = req.body.password;
    //res.end('<html><body>'+username+' and '+password+'</body></html>');
    //var user = req.param("username");
    //var pass = req.param("password")
    console.log("user="+username);
    console.log("pass="+password);

        //query = client.query('Select * from login_info where username=\''+username+'\' AND password=\''+password+'\';', function(err, result) {
        //done();
        //query.on('row',function(row) {

      pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log('the first query is: Select * from login_info where username=\''+username+'\' AND password=\''+password+'\';');
        var query = client.query('Select * from login_info where username=\''+username+'\' AND password=\''+password+'\';', function(err, result) {
          done();
          if(err) return console.error(err);
          console.log("rows length is "+result.rows.length);
          row_count = result.rows.length;
          if (row_count<1) {
            var new_son = {
              errCode: UserModel.ERR_BAD_CREDENTIALS
            };
            var format_son = JSON.stringify(new_son);
            res.end(format_son);
            return null;
          }
          console.log(result.rows[0].count);

          console.log('the second query is UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+username+'\' AND password=\''+password+'\';');
          client.query('UPDATE login_info SET count='+(result.rows[0].count+1)+' WHERE username =\''+username+'\' AND password=\''+password+'\';', function(err, result) {
            done();
            if(err) return console.error(err);
          });
          console.log(result.rows[0].count);
          var new_son = {
            errCode: UserModel.SUCCESS,
            count: (result.rows[0].count+1)
          };
          var format_son = JSON.stringify(new_son);
          res.end(format_son);
        });
      });
  });


app.post('/users/add', function(req, res) {
    //console.log(req.body);
    res.header('Content-Type', 'application/json');
    //res.write("<html><body>");
    var body = "<button onclick='window.location.assign(\"http://radiant-temple-1017.herokuapp.com/\");'>Click me</button>";
    var user = req.body.user;
    var password = req.body.password;
    //res.end('<html><body>'+username+' and '+password+'</body></html>');
    //var user = req.param("username");
    //var pass = req.param("password")
    console.log("user="+user);
    console.log("pass="+password);
    if (user.length>UserModel.MAX_USERNAME_LENGTH){
      var new_son = {
              errCode: UserModel.ERR_BAD_USERNAME
            };
            var format_son = JSON.stringify(new_son);
            res.end(format_son);
      return null;
    }
    if (password.length>UserModel.MAX_PASSWORD_LENGTH){
      var new_son = {
              errCode: UserModel.ERR_BAD_PASSWORD
            };
            var format_son = JSON.stringify(new_son);
            res.end(format_son);
      return null;
    }
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      if(user == ""){
                console.log("got a username thats an empty string");
                var new_son = {
                  errCode: UserModel.ERR_BAD_USERNAME,
                };
                var format_son = JSON.stringify(new_son);
                res.end(format_son);
                return null;
            }
           
            console.log('SELECT * FROM login_info WHERE username=\''+user+'\' AND password=\'' + password+'\'');
            client.query('SELECT * FROM login_info WHERE username=\''+user+'\' AND password=\'' + password+'\'', function(err, result){
                done();
                if(err) return console.error(err);
                console.log('result');
                if(result.rows.length > 0){
                    console.log("tried to add already existing user");
                    var new_son = {
                      errCode: UserModel.ERR_BAD_USER_EXISTS,
                    };
                    var format_son = JSON.stringify(new_son);
                    res.end(format_son);
                    return null;
                }
                else{
                    console.log("INSERT INTO login_info (username, password, count) VALUES (\'"+user+"\', \'"+password+"\',1);");
                    client.query("INSERT INTO login_info (username, password, count) VALUES (\'"+user+"\', \'"+password+"\',1);", function(err,result){
                      var new_son = {
                      errCode: UserModel.SUCCESS,
                      count: 1
                      };
                      var format_son = JSON.stringify(new_son);
                      res.end(format_son);
                      console.log(format_son);
                      return null;
                      });
                     }
                 });
    });
    //res.end();
});


app.post('/TESTAPI/resetFixture', function(req, res) {
  //res.writeHead(200, { 'content-type' : 'application/json' });
  res.header('Content-Type', 'application/json');
  var new_son = {
    errCode: UserModel.SUCCESS
  }
  var format_son = JSON.stringify(new_son);
  res.write(format_son);
  ourUser.TESTAPI_resetFixture();
  res.end();
});



app.post('/TESTAPI/unitTests', function(req, res) {
  res.header('Content-Type', 'application/json');
  function async(arg, callback) {
    console.log('do something with \''+arg+'\', return 1 sec later');
    setTimeout(function() { callback(arg * 2); }, 1000);
  }
  // Final task (same in all the examples)
  function final() { console.log('Done', results); }

  // A simple async series:
  var items = [ 1, 2, 3, 4, 5, 6 ];
  var results = [];
  function series(item) {
    if(item) {
      async( item, function(result) {
        results.push(result);
        return series(items.shift());
      });
    } else {
      return final();
    }
  }
  series(items.shift());
  //res.end(); 

  ourUser.TESTAPI_resetFixture();
  var tester = new TestUsers();
  console.log("STARTING THE UNIT TESTS");
  tester.setup(function() {
    tester.testAdd1(function(){
      tester.setup(function(){
        tester.testAddExists(function(){
          tester.setup(function(){
            tester.testAdd2(function(){
              tester.testAddEmptyUsername(function(){
                res.end("UNIT TESTS ARE OVER!"); 
              });
            });
          });
        })
      });
    });
  });

});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});