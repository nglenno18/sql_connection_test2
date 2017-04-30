const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var express = require('express');
const mysql = require('mysql');


const timestamps = [];

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var fs = require('fs');

var minute = new Date();
console.log('\nSTARTED :', minute.toString("hh:mm tt"));
var second = minute.getSeconds();
minute = minute.getMinutes();
console.log('\t', minute);

var schedule = require("node-schedule");
var rule = new schedule.RecurrenceRule();
// rule.minute = minute;
rule.second = 1;
rule.minute = 30;
rule.dayOfWeek = [0, new schedule.Range(0,6)];

var connection = null;
var mysql2 = require('mysql2');
var url = require('url');
var SocksConnection = require('socksjs');

QUOTAGUARDSTATIC_URL = 'http://7zl0kq03hlfpvy:8t9f75KusaE2TDhlqd8XpjscKw@us-east-1-static.quotaguard.com:9293';

var serv = app.listen(port, function(){
  console.log('App listening on port %s', serv.address().port);
  console.log('Press Ctrl+C to quit');

  schedule.scheduleJob(rule, function(){
    herokutest(function(array){
      console.log('callback called', array);
        return (array);
    });
  });

  // var rule2 = new schedule.RecurrenceRule();
  // rule2.second = 25;
  // rule2.dayOfWeek = [0, new schedule.Range(0,6)];
  // schedule.scheduleJob(rule2, function(){
  //   herokutest(function(array){
  //     console.log('callback called', array);
  //       return (array);
  //   });
  // })

  app.get('/records', function(err, res){
    res.status(200).send(timestamps);
  });

    app.get('/', function(err, res){
      herokutest(function(array){
        console.log('callback called', array);
          return res.status(200).send(array);
      });

      // sqlQuery_test(function(array){
      //   console.log('callback called', array);
      //   // return sqlQuery_test(function(array){
      //   //   console.log('callback called', array);
      //   //     return res.status(200).send(array);
      //   // });
      //     return res.status(200).send(array);
      // });
    });
}); //EnD APP LISTEN()

var sqlQuery_test = function(callback){
  connection = mysql.createConnection({
      host: '107.178.214.50',
      user     : 'root',
      password : 'nolan',
      database : 'db1'
  });
  connection.connect(function(err){
    if(!err) {
        console.log("\n\nDatabase is connected ... \n\n");

    } else {
        console.log("Error connecting database ... \n\n", err);
    }
  });


  tablename = 'times';
  console.log('Table = TIMES');
    var array = [];

  connection.query('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = \'' + tablename + '\';', function(er, res){
    var x = 0;
    for(x = 0; x < res.length; x++){
      array.push(res[x].COLUMN_NAME);
    }
    console.log(`\n\n\n\nFetching Fields for TABLE: `, tablename);
    console.log(`\t\t${tablename.toUpperCase()} --> DONE`);
    console.log(`\t\t${res.length} Fields in`, tablename);

    // console.log(`\n\nFIELDS for ${tablename}`, array);
    // return array;

    connection.end(function(err){
      if(!err) {
          console.log("\n\nDatabase is DISCONNECTED ... \n\n");
          callback(array);
      } else {
          console.log("Error DIS-connecting database ... \n\n", err);
      }
    });
  });

}

var herokutest = function(callback){
  var options, url, proxy;
  // http = require("http");
  url = require("url");
  proxy = url.parse(QUOTAGUARDSTATIC_URL); // <-- proxy url
  var username = proxy.auth.split(':')[0];
  var password = proxy.auth.split(':')[1];

  // target  = url.parse("http://ip.jsontest.com/");
  //
  // options = {
  //   hostname: proxy.hostname,
  //   port: proxy.port || 80,
  //   path: target.href,
  //   headers: {
  //     "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
  //     "Host" : target.hostname
  //   }
  // };
  //
  // http.get(options, function(res) {
  //   res.pipe(process.stdout);
  //   return console.log("status code", res.statusCode);
  // });

  var SocksConnection = require('socksjs');

  var mysql_server_options = {
    host: '107.178.214.50',
    port: 3306
  };

  var socks_options = {
    host: proxy.hostname,
    port: 1080,
    user: username,
    pass: password
  };

  var socksConn = new SocksConnection(mysql_server_options, socks_options);

  // console.log(socksConn);
  var mysql_options =  {
    database: 'db1',
    user: 'root',
    password: 'nolan',
    stream: socksConn
  }

  var mysqlConn = mysql2.createConnection(mysql_options);
  var arr;
  return mysqlConn.connect(function(err){
    if(err){console.log(err);}
    else{
      console.log('\n\nDatabase Connected!');
      var t = new Date();
      console.log('TIME: ', t.toString("hh:mm: aa"));
      console.log(t.toString("MMM/DD/yy   hh:mm: aa"));
      timestamps.push(t.toString("mm/dd/yy   hh:mm: aa"));

      return mysqlConn.query('SELECT 1+1 as test1;', function(err, rows, fields) {
        arr = rows;
        console.log('Result: ', rows);

        return mysqlConn.end(function(err){
          if(err) return console.log(err);
          console.log('\tDatabase DISCONNECTED!');
          var t = new Date();
          console.log('\t TIME: ', t.toString("hh:mm: tt"));
          console.log('\n\n\n');
          callback(rows);
          //PERFECT --> now go to udemy, review how to config HEROKU env. variables to stuff?
        });
      });
    }
  })

}
