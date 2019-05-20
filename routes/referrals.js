var express = require('express');
var router = express.Router();
var mysql = require('mysql');

/* GET connections. */
router.get('/', function (req, res) {
  res.render('referrals', { title: 'Referrals' });

  // Set up API Call
  var https = require('https');
  var options = {
    host: 'api.perkville.com',
    path: '/v2/referrals/?limit=100',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer AvFNkiOur4Zvtz1sG22kPmyS0u6OED'
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
        var referrals = response.objects;
        var connection = mysql.createConnection({
          host: 'brandbot-production.cca6bdmflswy.us-east-1.rds.amazonaws.com',
          user: 'emily',
          password: 'ca5LUAT94t6qmEDL',
          database: 'perkville'
        });

        var listOfReferrals = [];
        var columnNames = ['business', 'completed_dt', 'completion_triggering_event_detail', 'created_dt', 'location', 'user_id', 'referral_content', 'referral_date', 'referral_from_user', 'referral_source', 
          'referral_status', 'referral_to_user', 'referrer_conn_status', 'voucher', 'resource_uri'];

     //  for each referral in the response
        referrals.forEach(referral => {
          // reset the list for referral properites after each referral runs
          var referralProperties = [];

          // get the value from each column name, add it to a list of values
          for (i = 0 ; i < columnNames.length; i++) {
            var referralProperty = columnNames[i];
            referralProperties.push(JSON.stringify(referral[referralProperty]) || null);

          }

          listOfReferrals.push(referralProperties);
        });

        connection.connect();
        var tableName = "Referrals";

   //  first run.. create table 
/*    var sql = "ALTER TABLE Referrals ADD COLUMN business VARCHAR(255), ADD COLUMN completed_dt VARCHAR(255), ADD COLUMN completion_triggering_event_detail VARCHAR(255), ADD COLUMN created_dt VARCHAR(255), ADD COLUMN location VARCHAR(255), ADD COLUMN user_id VARCHAR(255), ADD COLUMN referral_content VARCHAR(255), ADD COLUMN referral_date VARCHAR(255), ADD COLUMN referral_from_user VARCHAR(255), ADD COLUMN referral_source VARCHAR(255), ADD COLUMN referral_status VARCHAR(255), ADD COLUMN referral_to_user VARCHAR(255), ADD COLUMN referrer_conn_status VARCHAR(255), ADD COLUMN voucher VARCHAR(255), ADD COLUMN resource_uri VARCHAR(255)";

      var sql =  [];
      for (j = 0; j < columnNames.length; j ++) {
        if (j === columnNames.length) {
          sql.push("ADD COLUMN " + columnNames[j] + " VARCHAR(255)");
        } else {
          sql.push("ADD COLUMN " + columnNames[j] + " VARCHAR(255)");
        }
      }
      var statement = "ALTER TABLE " + tableName;
      var query = statement + " " + sql;
      connection.query(query, function (error, results, fields) {
        if (error) {
          console.log("ERROR " + error);
          connection.end();
          throw error;
        }
      }); **/



  // insert into same set of columns list (business, connections, etc)
   //      var sql = "INSERT INTO Referrals (business, completed_dt, completion_triggering_event_detail, created_dt, location, user_id, referral_content, referral_date, referral_from_user, referral_source, referral_status, referral_to_user, referrer_conn_status, voucher, resource_uri) VALUES ?";
    var sql = "INSERT INTO " + tableName + " (";
    var query = sql + columnNames + ") VALUES ?";
    console.log('query ' + query);
    connection.query(query, [listOfReferrals], function (error, results, fields) {
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
