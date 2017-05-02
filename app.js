const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3001;
var express = require('express');
var bodyParser = require('body-parser');
const mysql = require('mysql');
// var jquery = require('');

var timestamps = [];
require('./config/config.js');
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
rule.second = 1;
rule.minute = 0;
rule.dayOfWeek = [0, new schedule.Range(0,6)];

var connection = null;
var mysql2 = require('mysql2');
var url = require('url');

var SocksConnection = require('socksjs');
var options, proxy;
proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL); // <-- proxy url
var username = proxy.auth.split(':')[0];
var password = proxy.auth.split(':')[1];

var SocksConnection = require('socksjs');

var mysql_server_options = {
  host: process.env.HOST,
  port: process.env.PORTE
};

var socks_options = {
  host: proxy.hostname,
  port: 1080,
  user: username,
  pass: password
};



var serv = app.listen(port, function(){
  console.log('App listening on port %s', serv.address().port);
  console.log('Press Ctrl+C to quit');

  // schedule.scheduleJob(rule, function(){
  //   herokutest(function(array){
  //     console.log('RULE 1 -- callback called', array);
  //       return (array);
  //   });
  // });

  // var rule2 = new schedule.RecurrenceRule();
  // rule2.second = 25;
  // rule2.dayOfWeek = [0, new schedule.Range(0,6)];
  // schedule.scheduleJob(rule2, function(){
  //   herokutest(function(array){
  //     console.log('RULE 2 -- callback called', array);
  //       return (array);
  //   });
  // })

  app.use(bodyParser.json());

  app.get('/records', function(err, res){
    res.status(200).send(timestamps);
  });
  app.get('/clearall', function(request, response){
    clearTimesheets(function(result){
      return response.status(200).send(result);
    });
  });

  app.get('/search/:id', function(request, response){
    findTimesheet(request.params.id, function(quer){
      console.log('Query Returned: ', quer);
      return response.status(200).send(quer);
    });
  });


  app.get('/timesheets/:id/:foreman/:project/:formid/:employees/:cc/:st/:da', function(request, response){
    //bodyparser takes JSON, converts to object
    console.log(request.body); //body gets stored by the bodyParser^^^

    var t = new Date();
    var tf = t.toString("hh:mm tt");
    console.log('TIME: ', t.toString("hh:mm tt"));

    var t = request.params.st;
    t = t.replace('-', ':');


    //now actually create a todo from input from the User
    var tm = {
      UniqueID: request.params.id,
      foreman: request.params.foreman,
      project: request.params.project,
      formid: request.params.formid,
      d: request.params.da,
      ts: 'TEAMsheet',
      employees: request.params.employees,
      cost_code: request.params.cc,
      timein:t
    }

    console.log(tm);

    var crew = tm.employees.split(',');
    console.log('\n\nCrew Members on this Sheet: ', crew);

    var x = 0;
    var crewsheets = [];
    for(x = 0; x < crew.length; x++){
        var emp = crew[x];
        console.log(emp);
        var sheet = {
          UniqueID: tm.UniqueID + x,
          project: tm.project,
          formid: tm.formid,
          d:tm.d,
          ts: 'TIMEsheet',
          employee: emp,
          cost_code: tm.cost_code,
          timein: tm.timein,
          teamsheet: tm.UniqueID,
          trade: 'none'
        }

        console.log(sheet);
        if(emp != tm.foreman){
          crewsheets.push(sheet);
          addTeamsheet(sheet, function(array){
            console.log('callback called', array);
              // return response.status(200).send(sheet);
          });
        }
    }
    // return response.status(200).send(JSON.stringify(crewsheets, 2, undefined));
    return response.redirect(process.env.RD + request.params.id);

  });
    app.get('/', function(err, res){
      herokutest(function(array){
        console.log('callback called', array);
          return res.status(200).send(array);
      });
    });
}); //EnD APP LISTEN()



var clearTimesheets = function(callback){
  establishProxy(function(mysql_options){
    var mysqlConn = mysql2.createConnection(mysql_options);
    var arr;
    return mysqlConn.connect(function(err){
      if(err){console.log(err);}
      else{
        console.log('\n\nDatabase Connected!');
        var t = new Date();
        var tf = t.toString("MMM/DD/yy   hh:mm: aa");
        console.log('TIME: ', t.toString("hh:mm: aa"));
        console.log(tf);
        // timestamps.push(tf);

        // return mysqlConn.query('INSERT INTO timesheets VALUES(\'' + tf +' \', \'\', \'\');', function(err, rows) {
        return mysqlConn.query('DELETE FROM timesheets WHERE UniqueID != \'l\';', function(err, rows) {
          arr = rows;
          console.log('Result: ', rows);
          console.log('Error: ', err);

          return mysqlConn.end(function(err){
            if(err) return console.log(err);
            console.log('\tDatabase DISCONNECTED!');
            var t = new Date();
            console.log('\t TIME: ', t.toString("hh:mm: tt"));
            console.log('\n\n\n');
            callback(rows);
            //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
          });
        });
      }
    })
  });
}

var addTimesheets = function(crewsheets,callback){
  establishProxy(function(mysql_options){
    var mysqlConn = mysql2.createConnection(mysql_options);
    var arr;
    return mysqlConn.connect(function(err){
      if(err){console.log(err);}
      else{
        console.log('\n\nDatabase Connected!');
        var t = new Date();
        var tf = t.toString("MMM/DD/yy   hh:mm: aa");
        console.log('TIME: ', t.toString("hh:mm: aa"));
        console.log(tf);
        // timestamps.push(tf);

        console.log('\n\nCREWSHEETS to INPUT into SQL: ', crewsheets);
        var i = 0;
        for(i = 0; i < crewsheets.length; i++){
          var entry = crewsheets[i];
          if(i = crewsheets.length - 1){
            callback(mysqlConn.query('INSERT INTO timesheets2 VALUES(\'' + tf +'\', \'' + entry.employee +'\', \'' + entry.UniqueID +'\');', function(err, rows){
              console.log(err);
              console.log('Result: ', rows);
            }))
          }
          mysqlConn.query('INSERT INTO timesheets2 VALUES(\'' + tf +'\', \'' + entry.employee +'\', \'' + entry.UniqueID +'\');', function(err, rows){
            console.log(err);
            console.log('Result: ', rows);
          });
        }
      }
    })
  });
}

var findTimesheet = function(id, callback){
  var socksConn = new SocksConnection(mysql_server_options, socks_options);

  // console.log(socksConn);
  var mysql_options =  {
    database: process.env.DB,
    user: process.env.US,
    password: process.env.PW,
    stream: socksConn
  }

  var mysqlConn = mysql2.createConnection(mysql_options);
  var arr;
  return mysqlConn.connect(function(err){
    if(err){console.log(err);}
    else{
      console.log('\n\nDatabase Connected!');
      var t = new Date();
      var tf = t.toString("MMM/DD/yy   hh:mm: aa");
      console.log('TIME: ', t.toString("hh:mm: aa"));
      console.log(tf);
      // timestamps.push(tf);

      // return mysqlConn.query('INSERT INTO timesheets VALUES(\'' + tf +' \', \'\', \'\');', function(err, rows) {
      return mysqlConn.query('SELECT * FROM timesheets2 WHERE UniqueID LIKE \'\%' + id + '\%\';', function(err, rows) {
        arr = rows;
        console.log('Result: ', rows);
        console.log('Error: ', err);

        return mysqlConn.end(function(err){
          if(err) return console.log(err);
          console.log('\tDatabase DISCONNECTED!');
          var t = new Date();
          console.log('\t TIME: ', t.toString("hh:mm: tt"));
          console.log('\n\n\n');
          callback(rows);
          //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
        });
      });
    }
  })
}

var addTeamsheet = function(entry, callback){
  establishProxy(function(mysql_options){
    var mysqlConn = mysql2.createConnection(mysql_options);
    var arr;
    return mysqlConn.connect(function(err){
      if(err){console.log(err);}
      else{
        console.log('\n\nDatabase Connected!');
        var t = new Date();
        var tf = t.toString("MMM/DD/yy   hh:mm: aa");
        console.log('TIME: ', t.toString("hh:mm: aa"));
        console.log(tf);
        // timestamps.push(tf);

        console.log('\n\n\n\nENTRY:', entry);
        var n = '';
        var nh = '00:00:00';
        var tt = 'ST';
        var no = 'No';

        // return mysqlConn.query('INSERT INTO timesheets VALUES(\'' + tf +'\', \'' + entry.employee +'\', \'' + entry.UniqueID +'\');', function(err,rows){
        return mysqlConn.query('INSERT INTO timesheets VALUES(\'' + entry.UniqueID +'\', \'' + entry.project +'\', ' +
        '\'' + entry.formid +'\', \'' + entry.d +'\',' +
        '\'' + entry.ts +'\', \'' + n +'\',' +
        '\'' + n +'\', \'' + entry.employee +'\',' +
        '\'' + entry.cost_code +'\', \'' + entry.trade +'\',' +
        '\'' + entry.timein +'\', \'' + n +'\',' +
        '\'' + nh +'\', \'' + tt +'\',' +
        '\'' + entry.teamsheet +'\', \'' + no +'\',' +
        '\'' + n +'\', \'' + n +'\',' +
        '\'' + n +'\', \'' + n +'\',' +
        '\'' + n +'\', \'' + n +'\',' +
        '\'' + n +'\', \'' + n +'\',' +
        '\'' + n +'\', \'' + n +'\',' +
        '\'' + n +'\', \'' + n +'\''
        +
        ');', function(err,rows){
            arr = rows;
            console.log('Result: ', rows);
            console.log('Error: ', err);

            return mysqlConn.end(function(err){
              if(err) return console.log(err);
              console.log('\tDatabase DISCONNECTED!');
              var t = new Date();
              console.log('\t TIME: ', t.toString("hh:mm: tt"));
              console.log('\n\n\n');
              callback(rows);
              //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
            });
        });


        // return mysqlConn.query('INSERT INTO timesheets2 VALUES(\'' + tf +'\', \'' + entry.employee +'\', \'' + entry.UniqueID +'\');', function(err, rows) {
        //   arr = rows;
        //   console.log('Result: ', rows);
        //   console.log('Error: ', err);
        //
        //   return mysqlConn.end(function(err){
        //     if(err) return console.log(err);
        //     console.log('\tDatabase DISCONNECTED!');
        //     var t = new Date();
        //     console.log('\t TIME: ', t.toString("hh:mm: tt"));
        //     console.log('\n\n\n');
        //     callback(rows);
        //     //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
        //   });
        // });
      }
    })
})
}

var establishProxy = function(callback){
  var socksConn = new SocksConnection(mysql_server_options, socks_options);

  // console.log(socksConn);
  var mysql_options =  {
    database: process.env.DB,
    user: process.env.US,
    password: process.env.PW,
    stream: socksConn
  }
  callback(mysql_options);
}

var sqlQuery_test = function(callback){
  connection = mysql.createConnection({
      host: process.env.HOST,
      database: process.env.DB,
      user: process.env.US,
      password: process.env.PW
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

  var socksConn = new SocksConnection(mysql_server_options, socks_options);

  // console.log(socksConn);
  var mysql_options =  {
    database: process.env.DB,
    user: process.env.US,
    password: process.env.PW,
    stream: socksConn
  }

  var mysqlConn = mysql2.createConnection(mysql_options);
  var arr;
  return mysqlConn.connect(function(err){
    if(err){console.log(err);}
    else{
      console.log('\n\nDatabase Connected!');
      var t = new Date();
      var tf = t.toString("MMM/DD/yy   hh:mm: aa");
      console.log('TIME: ', t.toString("hh:mm: aa"));
      console.log(tf);
      timestamps.push(tf);

      // return mysqlConn.query('INSERT INTO timesheets VALUES(\'' + tf +' \', \'\', \'\');', function(err, rows) {
      return mysqlConn.query('SELECT * FROM timesheets2;', function(err, rows) {
        arr = rows;
        console.log('Result: ', rows);
        console.log('Error: ', err);

        return mysqlConn.end(function(err){
          if(err) return console.log(err);
          console.log('\tDatabase DISCONNECTED!');
          var t = new Date();
          console.log('\t TIME: ', t.toString("hh:mm: tt"));
          console.log('\n\n\n');
          callback(rows);
          //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
        });
      });
    }
  })

}
