function UserModel(){
    /*
    var ERR_BAD_CREDENTIALS = -1;
    var ERR_BAD_PASSWORD = -4;
    var ERR_BAD_USERNAME = -3;
    var ERR_BAD_USER_EXISTS = -2;
    var MAX_PASSWORD_LENGTH = 128;
    var MAX_USERNAME_LENGTH = 128;
    var SUCCESS = 1;
    */


  /* THIS FUNCTION DOES ONE OF THREE THINGS
  1) Updates the counts of the logins in the database
  2) Returns the counts of the logins including this one
  3) Or else it will return an error code which we have to check for
  */
  function login(user,password){
/*
    client.query('Select * from login_info where username='+user+'AND ', function(err, result) {
      done();
      if(err) return console.error(err);
    });
    client.query('UPDATE login_info SET count='+, function(err, result) {
      done();
      if(err) return console.error(err);
    });
    query.on('row',function(row) {
      if row.length
    });
*/

  }
  
    /*
    This function checks that the user does not exists, the user name is not empty.
    (the password may be empty). If user does not exist, insert into db with a count of 1
    @params
    user: (string) the username
    password: (string) the password
    
    */
    function add(user,password){
        /*
        if(user == ""){
            return ERR_BAD_USERNAME;
        }
    
        var currCounter = client.query("SELECT count FROM login_info WHERE username=$1, password=$2", [user, password]);
        
        if(currCounter > 0){
            return ERR_BAD_USER_EXISTS;
        }
        else{
            client.query("INSERT INTO login_info (username, password, count) VALUES ($1, $2, $3)", [user, password, 1]);
        }
        */
        
    }
    
  function TESTAPI_resetFixture(){

  }

}

UserModel.ERR_BAD_CREDENTIALS = -1;
UserModel.ERR_BAD_PASSWORD = -4;
UserModel.ERR_BAD_USERNAME = -3;
UserModel.ERR_BAD_USER_EXISTS = -2;
UserModel.MAX_PASSWORD_LENGTH = 128;
UserModel.MAX_USERNAME_LENGTH = 128;
UserModel.SUCCESS = 1;







var express = require("express");
var logfmt = require("logfmt");
var app = express();

var pg = require('pg');
var users;

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
  res.end('<form action="signup" method="post">Username <input type="text" name="username"><br>Password <input type="text" name="password"><input type="submit" value="Submit"></form></body></html>');
  /*
  req.on('data',function(chunk) {
    body+= chunk;
    //res.write('<html><body>'+body+'<br>')
    //res.end('<form method="post">Username <input type="text" name="firstname"><br>Password <input type="text" name="lastname"><input type="submit" value="Submit"></form></body></html>');
    console.log(body)
  });
  */
  //WE SHOULD USE POST INSTEAD 
});



app.post('/signup', function(req, res) {
    //console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    //res.end('<html><body>'+username+' and '+password+'</body></html>');
    //var user = req.param("username");
    //var pass = req.param("password")
    console.log("user="+username);
    console.log("pass="+password);
    var body = "";

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      var query = client.query("SELECT * FROM login_info");
      
      query.on('row',function(row) {
        console.log("the row is"+row.username);
        /*
        if (username.length==0 || username.length > 128 ){
          body="This is an invalid username!"
        }
        if (row.username==username){
          body="You have already been here before!"
          client.query('UPDATE login_info SET', function(err, result) {
            done();
            if(err) return console.error(err);
            console.log("WE ARE CALLING FROM WITHIN THE POST");
          });
        }
        */
      });
    /*
      client.query('SELECT * FROM login_info', function(err, result) {
        done();
        if(err) return console.error(err);
        console.log("WE ARE CALLING FROM WITHIN THE POST");
      });
      client.query('INSERT INTO login_info VALUES (1,\''+username+'\',\''+password+'\')', function(err, result) {
        done();
        if(err) return console.error(err);
        console.log("WE ARE CALLING FROM WITHIN THE POST AGAIN");
        //console.log(result.rows);    
        query.on('row',function(row) {
          users = ('our first user is "%s"',row.Username);
        });
      });
*/
    });




    res.end("we did it");
    /*
    User.addUser(username, password, function(err, user) {
        if (err) throw err;
        res.redirect('/form');
    });
    */
});

pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  client.query('SELECT * FROM login_info', function(err, result) {
    done();
    if(err) return console.error(err);
    console.log("WE WILL BE STARTING HERE");
    //console.log(result.rows);
    /*    
    query.on('row',function(row) {
      users = ('our first user is "%s"',row.Username);
    });
    */
    
    users = result.rows[0].Username;
  });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});