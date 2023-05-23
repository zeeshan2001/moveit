"use strict";
const status              = require('../utils/status');
const Logger              = require('../classes/Logger');
const config              = require('../config');
const FileModel           = require('../models/file');
const auth                = require('../classes/Auth.js');
const fs                  = require('fs');
const async               = require('async');
const Excel               = require('../classes/Excel');
const ObjectId            = require('mongoose').Types.ObjectId; 


module.exports = function(app) {
    /**
     * @swagger
     * /file/all/:
     *   get:
     *     description: Requesting all meta informations of files
     *     tags:
     *       - Files
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Object containing users own data
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/File'
     *
     */
    app.get('/file/all/', auth.checkAuth, function(req, res, next) {
        FileModel.find({}, function(err, fileMetaList) {
            return res.status(status.OK).send(fileMetaList);
        }).populate('owner', '-session -email');
    });


    /**
     * @swagger
     * /file/{fileId}/sheet/{sheetId}/:
     *   get:
     *     description: Requesting JSON content from a file
     *     tags:
     *       - Files
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Object containing data in JSON.
     *       404:
     *         description: File not found.
     */
    app.get('/file/:fileId/sheet/:sheetId/', auth.checkAuth, function(req, res, next) {
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
                    found = true;
                    excel.getRowsFromSheet(fileMeta.sheets[i].name, function(rows) {
                        return res.send(rows);
                    });
                }
            }
            if (!found) {
                Logger.verbose("Requested sheet for (" + sid + ") not found");
                return res.status(status.NOT_FOUND).send({"message":"no such a sheet"}); 
            }  
        });
    });


    /**
     * @swagger
     * /file/:
     *   post:
     *     description: Uploading file(s) for storing them.
     *     tags:
     *       - Files
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: name
     *         description: Showing this name on the UI
     *         required: true
     *         type: string
     *       - name: content
     *         description: Base64 encoded file
     *         required: true
     *         type: string
     *     responses:
     *       202:
     *         description: Files have been accepted and saved or there weren't any files.
     *
     */
    app.post('/file/', auth.checkAuth, function(req, res, next) {
        var files = req.body;

        if (!Array.isArray(files)) {
            Logger.verbose("File upload failed. Array expected.");
            return res.status(status.NOT_ACCEPTABLE).send({
                "message":"Array expected."
            });
        } else if (files.length === 0) {
            Logger.verbose("Skipping. No files uploaded.");
            return res.status(200).send({"message":"Skipping. No files uploaded."});
        }
        const count = files.length;
        var i = 0;

        async.each(files, function(current_file, callback) {
            i++;
            var obj = new FileModel({
                status: "open",
                owner: req.user._id,
                name: current_file.name,
                draft: false
            });

            const base64Data = current_file.content.replace(/^data:image\/png;base64,/, "");
            const file_name = "./" + config.upload_dir + "/" + obj._id;
            fs.writeFileSync(file_name, base64Data, 'base64', function(err) {
                if (err) {
                    Logger.info("Failed to upload file: " + err);
                    return res.status(status.ERROR).send({});
                }
                Logger.verbose("Wrote file to filesystem.");
            });

            var excel = new Excel(obj._id);
            excel.getSheets(function(sheets) {
                obj.sheets = sheets;
                obj.save(function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        Logger.verbose("File saved to database");

                        if (i == count) {
                            Logger.verbose(count + " files have been uploaded.");
                            return res.status(status.OK).send({
                                "message": count + " files have been uploaded."
                            });
                        }
                    }
                });
            });
        }, function(err) {
            if(err) {
                Logger.info("MongoDB: Failed to save file: " + err);
            }
        });
    });
};