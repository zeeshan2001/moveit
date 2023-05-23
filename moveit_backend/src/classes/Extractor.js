"use strict";
const Logger                = require('./Logger');
const config                = require('../../src/config');
const excel                 = require('exceljs');
const asnyc                 = require('async');
const findDuplicates        = require('array-find-duplicates');
const Instance              = require('../models/instance');
const fs                    = require('fs');


module.exports = class Extractor {
    constructor() {
    }


    /**
     *  Checking if given column has any duplicates.
     *  @param rows from excel.
     *  @param columnIndex index of the column to be checked.
     *  @return true if dups detected.
     */
    static hasDuplicates(rows, columnIndex) {
        var entries = [];
        
        for (var i = 0; i < rows.length; i++) {
            entries.push(rows[i][columnIndex]);
        }
        
        var dups = findDuplicates(entries);
        if (dups.length === 0) {
            return 0;
        }
        return dups;
    };


    /**
     *  Filtering rows by a given value for a column
     *  @param rows from excel
     *  @param filters containing array of index and value
     *  @return filtered Rows
     */
    static filterRows(rows, filters) {
        var rowsResult = [];
        for (var j = 0; j < rows.length; j++) {
            var match = true;
            
            for (var k = 0; k < filters.length; k++) {
                if (rows[j][filters[k].index] != filters[k].value) {
                    match = false;
                    break;
                }
            }
            if (match) {
                rowsResult.push(rows[j]);
            }
        }
        return rowsResult;
    };


    /**
     *  Filtering rows "NOT EQUAL" by a given value for a column
     *  @param rows from excel
     *  @param filters containing array of index and value
     *  @return filtered Rows
     */
    static filterRowsNE(rows, filters) {
        var rowsResult = [];
        for (var j = 0; j < rows.length; j++) {
            var match = true;
            
            for (var k = 0; k < filters.length; k++) {
                if (rows[j][filters[k].index] != filters[k].value) {
                    match = false;
                    break;
                }
            }
            if (!match) {
                rowsResult.push(rows[j]);
            }
        }
        return rowsResult;
    };


    /**
     *  Excluding columns from array
     *  @param rows from excel
     *  @param columsn e.g. [0, 1]
     *  @return new rows with removed columns.
     */
    static excludeColumns(rows, columns) {
        for (var j = 0; j < rows.length; j++) {
            for (var k = 0; k < columns.length; k++) {
                rows[j].splice(columns[k], 1);
            }
        }
        return rows;
    };


    /**
     *
     */
    static getRowsFromJSON(filename) {
        var rows = "";
        try {
            const raw = fs.readFileSync(filename);
            rows = JSON.parse(rawdata); 
        } catch(ex) {
            throw ex;
        }
        return rows;
    };
};