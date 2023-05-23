"use strict";
const Logger        = require('./Logger');
const path          = require('path');
const config        = require('../../src/config');
const excel         = require('exceljs');


var workbook = "";
var loc = "";
var filename = "";


module.exports = class Excel {
    constructor(fn) {
        filename = fn;
        workbook = new excel.Workbook();
        
        loc = path.resolve(
            __dirname,
            '../../' + config.upload_dir + '/' + fn
        );
    };


    saveSheetAsJSON(sheetname, callback) {
        var location = path.resolve(
            __dirname,
            '../../' + config.upload_dir + '/' + filename + "_" + sheetname + '.json'
        );

        this.getRowsFromSheet(sheetname, function(rows) {
            fs.writeFile(location, rows, function(err) {
                if (err) {
                    Logger.verbose("FileSystem: " + err);
                    return false;
                } else {
                    return true;
                }
            }); 
        });
    };


    getRowsFromSheet(sheetname, callback) {
        var rows = [];
        workbook.xlsx.readFile(loc).then(function() {
            var worksheet = workbook.getWorksheet(sheetname);
            worksheet.eachRow({includeEmpty: false}, function(row, rowNumber) {
                rows.push(row.values);
            });
            callback(rows);
       });
    };


    getSheets(callback) {
        var sheets = [];
        workbook.xlsx.readFile(loc).then(function() {
            workbook.eachSheet(function(worksheet, sheetId) {
                sheets.push({
                    name: worksheet.name,
                    id: worksheet.id
                });
            });
            callback(sheets);
        });
    };
};