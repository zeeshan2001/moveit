/**
 *  Insert list of servers to the database.
 *  Used as init script.
 */
"use strict";
const Extractor         = require('../src/classes/Extractor');
const Excel             = require('../src/classes/Excel');
const fs                = require('fs');
const mongoose          = require('mongoose');
const async             = require('async');
const config            = require('../src/config');
const logger            = require('../src/classes/Logger');
const Instance          = require('../src/models/instance');

exports.script = function(callback) {
    mongoose.connect(config.database_address, {useNewUrlParser: true}, function(err) {
        if (!err) {
            // logger.info("Connected to MongoDB using " + config.database_address);
        } else {
            logger.error("Can\'t connect to MongoDB using ' + config.database_address");
            return false;
        }
    });

    let rows = JSON.parse(fs.readFileSync(
        '../queue/json/Inventory_Compare_Result5.xlsx/Gifhorn_1.json'
    ));
    let header = rows.shift();

    // rows = Extractor.filterRows(rows, [{
    //     "index": 3,
    //     "value": "Server"
    // }]);
    rows = Extractor.filterRows(rows, [{
        "index": 11,
        "value": "yes"
    }]);

    rows = Extractor.excludeColumns(rows, [17, 16, 14, 11, 10, 9, 8, 7, 6, 5, 4, 3, 1, 0]);
    header = Extractor.excludeColumns([header], [17, 16, 14, 11, 10, 9, 8, 7, 6, 5, 4, 3, 1, 0])[0];
    // Header: [ 'systemname', 'Inventory No ', 'Rack', 'allSERIAL_NO' ]

    async.eachSeries(rows, function(row, done) {
        const serverName = row[0];

        async.waterfall([
            function(next) {
                Instance.findOne({name: serverName}, function(err, server) {
                    if (err) {
                        console.log(">>> ERROR: ", err);
                        return next(null, null);
                    }
                    if (!server) {
                        console.log(">>> ERROR: Server " + serverName + " not found!");
                        return next(null, null);
                    }
                    next(null, server);
                });
            },
            function(server, next) {
                if (server == null || !server) {
                    return next(null, null);
                }
                if (!server.attributes) {
                    server.attributes = {};
                }
                server.inventory = true;
                server.attributes.inventory_number = row[1];
                server.attributes.rack = row[2];
                server.attributes.seriennummer = row[3];
                next(null, server);
            },
            function (server, next) {
                if (server == null || !server) {
                    return next(null, null);
                }
                Instance.findOneAndUpdate({name: serverName}, server, function(err, savedInstance) {
                    if (err) {
                        console.log(">>> ERROR: Server update failed: " + err);
                        return next(null);
                    }
                    next(null);
                });
            }
        ], function(code) {
            // console.log("Server " + serverName + " inventored!");
            done();
        });
    }, function allDone (err) {
        console.log("[InitScript]: Updated " + rows.length + " instances.");
        callback();
    });
};