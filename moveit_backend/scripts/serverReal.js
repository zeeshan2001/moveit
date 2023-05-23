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

exports.serverReal = function(callback) {
    mongoose.connect(config.database_address, {useNewUrlParser: true}, function(err) {
        if (!err) {
            // logger.info("Connected to MongoDB using " + config.database_address);
        } else {
            logger.error("Can\'t connect to MongoDB using ' + config.database_address");
            return false;
        }
    });

    // let rows = JSON.parse(fs.readFileSync('../queue/json/ExportCMDB.xlsx/Tabelle1_1.json'));
    let rows = JSON.parse(fs.readFileSync('../queue/json/ExportCMDB.xlsx/Tabel_new.json'));
    // rows = Extractor.excludeColumns(rows, [0]);
    let header = rows.shift();
    //
    // rows = Extractor.filterRows(rows, [{
    //     "index": 1,
    //     "value": "Server"
    // }]);

    var serverIndex = 0;


    async.eachSeries(rows, function(row, done) {
        const name = row[serverIndex] ? row[serverIndex] : "-";
        var instance = new Instance({
            name: name ,
            attributes: {},
            applications: [],
            components: [],
            comments: [],
            type: 'server',
            status: 'open',
            migrated: false,
            planned: false,
            inventory: false,
            workflow: {}
        });
        var attrs = {};
        for (var i = 0; i < row.length; i++) {
            if (i == serverIndex) {
                continue;
            }
            else if(header[i].toLowerCase() === 'verbleib'){
                // for tabel_new.json
                // attrs['verbleib'] = ["Virtualisieren FFM","Virtualisieren GF","Ersatz FFM","Ersatz GF","Klären","Verschrotten","Deinventarisieren","Wartung"];
                attrs['verbleib'] = ["Virtualisieren FFM","Virtualisieren GF","Ersatz FFM","Ersatz GF","Klären","Verschrotten",
                                    "Deinventarisieren","Wartung","Recherche","Verschrottung","Ersatz","OK"];
                attrs['verbleib_selected'] = row[i];
            }
            else if(header[i].toLowerCase() === 'arbeitspaket'){
                attrs['arbeitspaket'] = ["U1","U2","U3","U4(ECC)","R1","R2","R5","R6","R7","R8","R9","R10",
                                        "R11","R14","R15","R16","R12/U12","R13/U13","R17/U17","SU1",
                                        "SU2","SU3","SR4","SR5","SR6","SR7","SR8","SR9","SR10","SR11","SR12","SR13","SR14","SR15","SR16",
                                        "SR17","SR18","SR19","SR20","SR21","SR22","SR23","SR24","SR26",
                                        "SR27","SR28","SR29","SR30","SR31","SR32","SR33","SR34","SR35",
                                        "SR36","SR37","SR38","SR39","SR40"];
                attrs['arbeitspaket_selected'] = row[i];

            }
            else{
                attrs[header[i].toLowerCase()] = row[i];
            }
        }
        instance.attributes = attrs;

        instance.save(function (err, savedInstance) {
            if (err) {
                console.log("Error: " + JSON.stringify(err));
            }
            // console.log("inserted " + name);
            done();
        });
    }, function allDone (err) {
        console.log("[InitScript]: " + rows.length + " servers has been inserted!");
        callback();
    });
};