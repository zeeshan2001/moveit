/**
 *  Merging apps to the servers.
 *  Use server.js before.
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


mongoose.connect(config.database_address, {useNewUrlParser: true}, function(err) {
    if (!err) {
        logger.info("Connected to MongoDB using " + config.database_address);
    } else {
        logger.error("Can\'t connect to MongoDB using ' + config.database_address");
        return false;
    }
});


var rows = JSON.parse(fs.readFileSync('../queue/json/services.json'));

Extractor.excludeColumns(rows, [0]);

var header = rows.shift();
const key = 1;

async.each(rows, function(row, callback) {
	var application = {
		app_status: 'open',
		migrated: false,
		workflow: {},
		attributes: {}
	};

	for (var i = 0; i < row.length; i++) {
        if (i == key) {
            continue;
        }
        application[header[i].toLowerCase()] = row[i];
    }
	
	Instance.findOneAndUpdate({name: row[key]}, {
		"$push": {
			applications: application
		}
	}, function(err, insertion) {
		if (err) {
			console.log("Err: " + err);
		}
	});
}, function(err) {
});