var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var columnNames = [];
var tableName = 'Perks';

/* GET connections. */
router.get('/', function (req, res) {
    res.render('perks', { title: 'Perks' });

    // Set up API Call
    var https = require('https');

    var options = {
        host: 'api.perkville.com',
        path: '/v2/' + tableName.toLowerCase() + '/?limit=100',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer AvFNkiOur4Zvtz1sG22kPmyS0u6OED'
        }
    };
    req = https.get(options, function (res) {
        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        res.on('data', function (chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
        }).on('end', function () {
            var body = Buffer.concat(bodyChunks);
            const response = JSON.parse(body);
            if (response.objects.length > 0) {
                var responseObjects = response.objects;
                var connection = mysql.createConnection({
                    host: 'brandbot-production.cca6bdmflswy.us-east-1.rds.amazonaws.com',
                    user: 'emily',
                    password: 'ca5LUAT94t6qmEDL',
                    database: 'perkville'
                });

                var listOfValues = [];
                var sql = [];

                //  for each object in the response
                responseObjects.forEach(object => {
                    // reset the list for properites after each object runs
                    var tableProperties = [];
                    columnNames = Object.keys(object);
                    // get the value from each column name, add it to a list of values
                    for (i = 0; i < columnNames.length; i++) {
                        console.log('INDEX ' + i);

                        var tableProperty = columnNames[i];
                        tableProperties.push(JSON.stringify(object[tableProperty]) || null);
                    }
                    //    console.log('sql ' + sql);

                    listOfValues.push(tableProperties);
                });

                connection.connect();

                //  first run.. create table 
                /*    var sql = "ALTER TABLE Referrals ADD COLUMN business VARCHAR(255), ADD COLUMN completed_dt VARCHAR(255), ADD COLUMN completion_triggering_event_detail VARCHAR(255), ADD COLUMN created_dt VARCHAR(255), ADD COLUMN location VARCHAR(255), ADD COLUMN user_id VARCHAR(255), ADD COLUMN referral_content VARCHAR(255), ADD COLUMN referral_date VARCHAR(255), ADD COLUMN referral_from_user VARCHAR(255), ADD COLUMN referral_source VARCHAR(255), ADD COLUMN referral_status VARCHAR(255), ADD COLUMN referral_to_user VARCHAR(255), ADD COLUMN referrer_conn_status VARCHAR(255), ADD COLUMN voucher VARCHAR(255), ADD COLUMN resource_uri VARCHAR(255)";
                **/

                columnNames.forEach(columnName => {
                        // build out SQL query
                        if (columnNames.indexOf(columnName) === columnNames.length) {
                            sql.push(" ADD COLUMN " + columnName + " VARCHAR(255)");
                        } else {
                            sql.push("ADD COLUMN " + columnName + " VARCHAR(255)");
                        }
                });
                var statement = "ALTER TABLE " + tableName;
                var query = statement + " " + sql;

                connection.query(query, function (error, results, fields) {
                    if (error) {
                        console.log("ERROR " + error);
                        connection.end();
                        throw error;
                    }
                });

                // insert into same set of columns list (business, connections, etc)
                //      var sql = "INSERT INTO Referrals (business, completed_dt, completion_triggering_event_detail, created_dt, location, user_id, referral_content, referral_date, referral_from_user, referral_source, referral_status, referral_to_user, referrer_conn_status, voucher, resource_uri) VALUES ?";
                var insertSql = "INSERT INTO " + tableName + " (";
                var query = insertSql + columnNames + ") VALUES ?";
                connection.query(query, [listOfValues], function (error, results, fields) {
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

}

);


// GET the data
/**
connection.query('SELECT * FROM Users', function (error, results, fields) {
  if (error) throw error;
  console.log('The result is: ', results[0]);
}); */
//});

module.exports = router;
