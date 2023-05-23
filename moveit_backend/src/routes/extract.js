"use strict";
const status              = require('../utils/status');
const Logger              = require('../classes/Logger');
const config              = require('../config');
const auth                = require('../classes/Auth.js');
const async               = require('async');
const Excel               = require('../classes/Excel');
const ObjectId            = require('mongoose').Types.ObjectId; 
const FileModel           = require('../models/file');
const Extractor           = require('../classes/Extractor');


module.exports = function(app) {
    app.post('/extract/json/', auth.checkAuth, function(req, res, next) {
        var head = req.body.head;
        var rows = req.body.body;
        var result = Extractor.extract(head, rows);
        return res.send(result);

    });


    app.post('/extract/:fileId/sheet/:sheetId/', function(req, res, next) {
        const fid = req.params.fileId;
        const sid = req.params.sheetId;
        var fileId = null;
        
        try {
            fileId = new ObjectId(fid);
        } catch (ex) {
            Logger.verbose("Invalid ObjectId: " + fid + ". Ex: " + ex);
            return res.status(status.NOT_FOUND).send({"message":"invalid object id"});
        }
        
        FileModel.findOne({_id: fileId}, function(err, fileMeta) {
            if (err || !fileMeta) {
                Logger.verbose("Requested file for JSON (" + fid + ") not found");
                return res.status(status.NOT_FOUND).send({"message":"no such a file"});
            }
            var excel = new Excel(fileMeta._id);
            var found = false;

            for (var i = 0; i < fileMeta.sheets.length; i++) {
                if (fileMeta.sheets[i].id == sid) {
                    Logger.verbose("Sheetfile " + sid + ": Found!");

                    found = true;
                    excel.getRowsFromSheet(fileMeta.sheets[i].name, function(rows) {
                        Logger.verbose("Sheetfile " + sid + ": Rows found!");
                        var header = rows.shift();
                        
                        rows = Extractor.filterRows(rows, [{index:3, value:'Server'}]);

                        var dups = Extractor.hasDuplicates(rows, 2);
                        if (dups !== 0) {
                            Logger.verbose("File has duplicates (" + sid + ")!");
                            return res.status(status.NOT_ACCEPTABLE).send({
                                "message":"duplicates detected",
                                "code":"duplicates",
                                "content": dups
                            }); 
                        }
                        
                        Extractor.feedServerWithData(rows, header, 2);
                        Logger.verbose("Extracted sheet ID " + sid + "!");
                        return res.status(200).send({});
                    });
                }
            }
            if (!found) {
                Logger.verbose("Requested sheet for (" + sid + ") not found");
                return res.status(status.NOT_FOUND).send({"message":"no such a sheet"}); 
            }
        });
    });
};