var express = require('express');
var router = express.Router();
var mysql = require('mysql');
//var dataReturned = false;
//var users = [];

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('users', { title: 'Users' });
  // Make API Call
  
  var https = require('https');
  var options = {
    host: 'api.perkville.com',
    path: '/v2/users/',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer AvFNkiOur4Zvtz1sG22kPmyS0u6OED'
    }
  };

  var req = https.get(options, function(res) {

    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
    //  console.log('BODY: ' + body);
      const response = JSON.parse(body);
   //   console.log('objects' + JSON.stringify(response.objects));
      if (response.objects.length > 0) {
        var users = response.objects;
        var connection = mysql.createConnection({
          host     : 'brandbot-production.cca6bdmflswy.us-east-1.rds.amazonaws.com',
          user     : 'emily',
          password : 'ca5LUAT94t6qmEDL',
          database : 'perkville'
        });
      
        // insert into same set of columns list (business, connections, etc)

        var values = [];
        var columnNames = ['birthday', 'connections', 'emails', 'first_name', 'last_mod_dt', 'last_name', 'phone_number', 'resource_uri', 'user_id'];
        // for each person in the response
        rowVals = [];
        users.forEach(user => {

          // get the value from each column name, add it to a list of values
          // then each user gets their own list mapped to them
          for (i = 0 ; i < columnNames.length; i++) {
            var column = columnNames[i];
            if (column === 'emails') {
              // we have multiple emails in the response
              rowVals.push("'"+JSON.stringify(user.emails)+"'");
            }
            else {
              rowVals.push("'"+user[column]+"'" || 'null');
            }
          }
          console.log('rowVals ' + "["+rowVals+"]");
          values.push("["+rowVals+"]");
        });
        //    var sql = "INSERT INTO testing (test) VALUES: ?";
          var sql = "INSERT INTO Users (birthday, connections, emails, first_name, last_mod_dt, last_name, phone_number, resource_uri, user_id) VALUES ?";

          connection.connect();
          connection.query(sql, [values], function (error, results, fields) {
            if (error) {
              console.log("ERROR " + error);
              connection.end();
              throw error;
            }
        //    console.log('The result is: ', results[0]);
        //    console.log('The fields are: ', fields);
          });

        connection.end();
      }
    })
  });
 
    // GET the data
    /**
    connection.query('SELECT * FROM testing', function (error, results, fields) {
      if (error) throw error;
      console.log('The solution is: ', results[0]);
    }); */
  });

module.exports = router;
