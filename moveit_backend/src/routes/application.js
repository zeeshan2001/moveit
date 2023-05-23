"use strict";
const status                = require('../utils/status');
const mongoose              = require('mongoose');
const InstanceModel         = require('../models/instance');
const Logger                = require('../classes/Logger');
const config                = require('../config');
const auth                  = require("../classes/Auth.js");


/**
 * @swagger
 * definitions:
 *   ApplicationOverview:
 *     properties:
 *       count:
 *         type: string
 *         description: Count of the server which have the app.
 *       app_name:
 *         type: string
 *         required: true
 *         description: Name of the app - used as ID
 */

module.exports = function(app) {
    /**
     * @swagger
     * /application/field/{name}/:
     *   get:
     *     description: Requesting available values of a field. Used for suggestions.
     *     tags:
     *       - Applications
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Array
     *
     */
    app.get('/application/field/:name/', auth.checkAuth, function(req, res, next) {
        const key = req.params.name;
        InstanceModel.aggregate([
            {"$unwind": "$applications"},
            {"$project": {
                _id: 0,
                [`${key}`]: '$applications.' + key,
            }},
            {"$group": {
                _id:{[`${key}`]: '$' + key},
            }},
            {"$project": {
                _id: 0,
                [`${key}`]: "$_id." + key,
                count: 1
            }}
        ],
        function(err, instances) { 
            var nameArray = [];
            for (var i = 0; i < instances.length; i++) {
                if (instances[i][key]) {
                    nameArray.push(instances[i][key]);
                }
            }
            return res.status(200).send(nameArray);
        });
    });


    /**
     * @swagger
     * /application/summary/:
     *   get:
     *     description: Requesting summary
     *     tags:
     *       - Applications
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Object
     *         schema:
     *             $ref: '#/definitions/Summary'
     *
     */
    app.get('/application/summary/', auth.checkAuth, function(req, res, next) {
        InstanceModel.aggregate([
            {"$unwind": "$applications"},
            {"$project": {
                _id: 0,
                'status': '$applications.app_status',
            }},
            {"$group": {
                _id:{'status': '$status'},
                count: {$sum:1}
            }},
            {"$project": {
                _id: 0,
                "status": "$_id.status",
                count: 1
            }}
        ],
        function(err, instances) { 
            if (err) {
                Logger.verbose("Error: " + err);
                return res.status(status.STATUS).send({"message":"unexpected error"});
            }
            var result = {};

            for (var i = 0; i < instances.length; i++) {
                result[instances[i].status] = instances[i].count;
            }
            InstanceModel.aggregate([
                {"$unwind": "$applications"},
                {"$project": {
                    _id: 0,
                    'inventory': '$applications.inventory',
                }},
                {"$match": {
                    inventory: true
                }},
                {"$group":{
                    _id: null,
                    count: {
                        $sum: 1
                    }
                }},
                {"$project": {
                    _id: 0
                }}
            ],
            function(err, countValid) {
                if (!countValid[0]) {
                    countValid[0] = {
                        count: 0
                    }
                }

                return res.status(status.OK).send({
                    open: result.open | 0,
                    progress: result.progress | 0,
                    done: result.done | 0,
                    valid: countValid[0].count | 0
                }); 
            });
        });
    });


    /**
     * @swagger
     * /application/meta/:
     *   get:
     *     description: Requesting application meta info e.g. mandatory fields
     *     tags:
     *       - Applications
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all available meta
     *
     */
    app.get('/application/meta/', auth.checkAuth, function(req, res, next) {
        const mandatory = config.app_settings.meta.application;

        return res.status(status.OK).send(mandatory);
    });


    /**
     * @swagger
     * /application/:
     *   get:
     *     description: Requesting all applications and their counts
     *     tags:
     *       - Applications
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Array containing list of object of count and app_name
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/ApplicationOverview'
     *
     */
    app.get('/application/', auth.checkAuth, function(req, res, next) {
        var key = config.app_settings.app_key_field;

        InstanceModel.aggregate([
            {"$unwind": "$applications"},
            {"$project": {
                _id: 0,
                [`${key}`]: `$applications.${key}`,
            }},
            {"$group": {
                _id:{[`${key}`]: `$${key}`},
                count: {$sum:1}
            }},
            {"$project": {
                _id: 0,
                "app_name": "$_id." + key,
                count: 1
            }},
            {$sort: {app_name: 1}}
        ],
        function(err, instances) { 
            if (err) {
                Logger.verbose("Error: " + err);
                return res.status(status.STATUS).send({"message":"unexpected error"});
            }
            return res.status(status.OK).send(instances); 
        });
    });


    /**
     * @swagger
     * /application/status/{status}/:
     *   get:
     *     description: Filtering and grouping applications by their status
     *     tags:
     *       - Applications
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Array containing list of object of count and app_name
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/ApplicationOverview'
     *
     */
    app.get('/application/status/:status/', auth.checkAuth, function(req, res, next) {
        const key = config.app_settings.app_key_field;
        const _status = req.params.status;

        InstanceModel.aggregate([
            {"$unwind": "$applications"},
            {"$match": {"applications.app_status": _status}},
            {"$project": {
                _id: 0,
                [`${key}`]: `$applications.${key}`
            }},
            {"$group": {
                _id:{[`${key}`]: `$${key}`},
                count: {$sum:1}
            }},
            {"$project": {
                _id: 0,
                "app_name": "$_id." + key,
                count: 1
            }},
            {$sort: {app_name: 1}}
        ],
        function(err, instances) { 
            if (err) {
                Logger.verbose("Error: " + err);
                return res.status(status.STATUS).send({"message":"unexpected error"});
            }
            return res.status(status.OK).send(instances); 
        });
    });


    /**
     * @swagger
     * /application/{app_name}/server/{status}/:
     *   get:
     *     description: Getting all server containing given app name and status
     *     tags:
     *       - Applications
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Array containing list of instances
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Instance'
     *
     */
    app.get('/application/:app_name/server/:status/', auth.checkAuth, function(req, res, next) {
        const key = config.app_settings.app_key_field;
        const app_name = req.params.app_name;
        const app_status = req.params.status;

        if (app_status === "all") {
            InstanceModel.find({
                [`applications.${key}`]: app_name
            }, function(err, instances) {
                return res.send(instances);
            });
        } else {
            InstanceModel.find({
                [`applications.${key}`]: app_name,
                'applications.app_status': app_status
            }, function(err, instances) {
                return res.send(instances);
            });
        }
    });
};