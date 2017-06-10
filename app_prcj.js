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


  app.use(bodyParser.json());

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


  app.get('/timesheets/:type/:id/:foreman/:project/:formid/:employees/:cc/:st/:timeout/:da/:hours', function(request, response){
    //bodyparser takes JSON, converts to object
    console.log(request.body); //body gets stored by the bodyParser^^^

    var t = new Date();
    var tf = t.toString("hh:mm tt");
    console.log('TIME: ', t.toString("hh:mm tt"));

    var t = request.params.st;
    t = t.replace('-', ':');

    var to = request.params.timeout.replace('-', ':');
    var type = request.params.type;

    // var count = (t.match(/is/g) || []).length;
    // for( var e = 0; e < count; e++){
    //   t = t.replace('-', ':');
    // }
    // var to = request.params.timeout;
    // count = (to.match(/is/g) || []).length;
    // for( var e = 0; e < count; e++){
    //   to = to.replace('-', ':');
    // }
    var hr = request.params.hours;

    //now actually create a todo from input from the User
    var tm = {
      UniqueID: request.params.id,
      foreman: request.params.foreman,
      cons_proj: request.params.project,
      cons_id: request.params.formid,
      pr_proj: "",
      pr_id: "",
      d: request.params.da,
      ts: 'TEAMsheet',
      employees: request.params.employees,
      cost_code: request.params.cc,
      timein:t,
      timeout: to,
      hours: hr
    }

    if(type == 'Pavement'){
      tm.cons_proj = "";
      tm.cons_id = "";
      tm.pr_proj = request.params.project;
      tm.pr_id = request.params.formid;
    }
    console.log(tm);

    var crew = tm.employees.split(',');
    console.log('\n\nCrew Members on this Sheet: ', crew);

    var x = 0;
    var crewsheets = [];
    var array = [];
    for(x = 0; x < crew.length; x++){
        var emp;
        if(crew[x].charAt(0)== ' '){
          emp = crew[x].substring(1);
        }else{
          emp = crew[x];
        }
        console.log(emp);
        var sheet = {
          UniqueID: tm.UniqueID + '' + x,
          cons_proj: tm.cons_proj,
          cons_id: tm.cons_id,
          pr_proj: tm.pr_proj,
          pr_id: tm.pr_proj,
          date:tm.d,
          ts: 'TIMEsheet',
          foreman: tm.foreman,
          employee: emp,
          cost_code: tm.cost_code,
          timein: tm.timein,
          timeout: tm.timeout,
          teamsheet: tm.UniqueID,
          hours: tm.hours,
          trade: 'none',
          requested: 'no'
        }
        var entry = sheet;
        var entryarray = [];
        entryarray.push(entry.UniqueID);
        entryarray.push(entry.cons_proj);
        entryarray.push(entry.cons_id);
        entryarray.push(entry.pr_proj);
        entryarray.push(entry.pr_id);
        entryarray.push(entry.date);
        entryarray.push(entry.ts);
        entryarray.push(entry.foreman);
        entryarray.push(entry.employee);
        entryarray.push(entry.cost_code);
        entryarray.push(entry.timein);
        entryarray.push(entry.timeout);
        entryarray.push(entry.hours);
        entryarray.push(entry.teamsheet);
        entryarray.push(entry.requested);

        console.log(sheet);
        if(emp != tm.foreman){
          array.push(entryarray);
        }
    }

    addBatchTimesheets(array, function(err, res){
      console.log('Batch timesheets sent: ERROR:', err);
      console.log('Batch timesheets sent: RESULT:', res);
    });
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

var addBatchTimesheets = function(entry, callback){
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


        return mysqlConn.query(
        'INSERT INTO timesheets(UniqueID,cons_proj,cons_id,pr_proj,pr_id,date,sheet_type,foreman,employee,cost_code,start_time,end_time,hours,parent_sheet, requested)'+
        ' VALUES ?;', [entry], function(err,rows){
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
