var express = require('express');
var router = express.Router();
var mysql = require('mysql');

/* GET users listing. */
router.get('/', function (req, res) {
  res.render('users', { title: 'Users' });

  // Set up API Call
  var https = require('https');
  var options = {
    host: 'api.perkville.com',
    path: '/v2/users/?limit=100',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{accessToken}}'
    }
  };

  var req = https.get(options, function (res) {

    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function (chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function () {
      var body = Buffer.concat(bodyChunks);
      const response = JSON.parse(body);
      if (response.objects.length > 0) {
        var users = response.objects;
        var connection = mysql.createConnection({
          host: 'brandbot-production.cca6bdmflswy.us-east-1.rds.amazonaws.com',
          user: 'emily',
          password: 'ca5LUAT94t6qmEDL',
          database: 'perkville'
        });

        var listOfUsers = [];
        var columnNames = ['birthday', 'connections', 'emails', 'first_name', 'last_mod_dt', 'last_name', 'phone_number', 'resource_uri', 'user_id'];
        //  for each person in the response
        users.forEach(user => {
          // reset the list for user properites after each user runs
          var userProperties = [];

          // get the value from each column name, add it to a list of values
          // then each user gets their own list mapped to them
          for (i = 0 ; i < columnNames.length; i++) {
            var userProperty = columnNames[i];
            // TODO: is this necessary? what does the DB show without it?
            if (userProperty === 'emails') {
              // email array includes objects
              // to avoid [Object object] from being inserted into DB
              userProperties.push("'"+JSON.stringify(user.emails)+"'");
            }
            else {
              userProperties.push(JSON.stringify(user[userProperty]) || null);
            }
          }

          listOfUsers.push(userProperties);
        });

        connection.connect();
        // insert into same set of columns list (business, connections, etc)
        var sql = "INSERT INTO Users (birthday, connections, emails, first_name, last_mod_dt, last_name, phone_number, resource_uri, user_id) VALUES ?";
        connection.query(sql, [listOfUsers], function (error, results, fields) {
          if (error) {
            console.log("ERROR " + error);
            connection.end();
            throw error;
          }
        });

        connection.end();
      }
    })
  });

  // GET the data
  /**
  connection.query('SELECT * FROM Users', function (error, results, fields) {
    if (error) throw error;
    console.log('The result is: ', results[0]);
  }); */
});

module.exports = router;
