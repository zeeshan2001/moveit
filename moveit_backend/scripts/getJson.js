"use strict";
const Extractor         = require('../src/classes/Extractor');
const Excel             = require('../src/classes/Excel');
const fs                = require('fs');
const config 			= require('../src/config');
const path 				= require('path');
const mkdirp            = require('mkdirp');
const async             = require('async');


const files = [
	"Chart_Inventory_alleSysteme.xlsx"
];
const newNames = [
    "CMDB"
];


for (var i = 0; i < files.length; i++) {
    var excel = new Excel(files[i]);
    excel.getSheets(function(sheets) {
        async.each(sheets, function(sheet, callback) {
            excel.getRowsFromSheet(sheet.id, function(rows) {
                if (rows.length !== 0) {
                    var loc = path.resolve(
                        __dirname,
                        '../' + config.upload_dir + '/json/' + files[0] + "/" + sheet.name + "_"+ sheet.id + ".json"
                    );
                    
                    mkdirp(path.resolve(
                        __dirname,
                        '../' + config.upload_dir + '/json/' + files[0]
                    ), function(err) { 
                        if (err) {
                            console.log(err);
                        }
                        fs.writeFileSync(loc, JSON.stringify(rows));
                        console.log("OUTPUT >> " + loc);
                    });
                }
            });
        }, function(err) {
        });
    });
}