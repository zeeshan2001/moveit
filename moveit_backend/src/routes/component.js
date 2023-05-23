"use strict";
const status                = require('../utils/status');
const mongoose              = require('mongoose');
const ObjectId              = require('mongoose').Types.ObjectId; 
const ComponentModel        = require('../models/component');
const Logger                = require('../classes/Logger');
const config                = require('../config');
const auth                  = require("../classes/Auth.js");


module.exports = function(app) {
    /**
     * @swagger
     * /component/{id}/:
     *   delete:
     *     description: Deleting given component
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Component removed
     *
     */
    app.delete('/component/:component_id/', auth.checkAuth, function(req, res, next) {
        const iid = req.params.component_id;
        var componentId = -1;
        
        try {
            componentId = new ObjectId(iid);
        } catch (ex) {
            Logger.verbose("Invalid ObjectId: " + iid + ". Ex: " + ex);
            return res.status(status.NOT_FOUND).send({"message":"invalid object id"});
        }

        ComponentModel.findOneAndRemove({_id: componentId}, function(err, component) {
            if (err) {
                return res.status(status.NOT_FOUND).send({});
            }
            var history = new HistoryModel({
                username: req.user.username,
                user_id: req.user._id,
                type: HistoryType.component,
                action_tag: HistoryTag.deleted,
                reference: component._id,
                item: component
            });
            history.save(function(err) {
                if (err) {
                    Logger.info("Can't write history: " + JSON.stringify(history)
                        + " REASON: " + err);
                    return;
                }
                Logger.info("Writing histroy: " + JSON.stringify(history));
                return res.status(status.OK).send({});
            });
        });
    });


    /**
     * @swagger
     * /component/:
     *     description: Inserting a component
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Component added
     *       406:
     *         description: Component key already exist
     *
     */
    app.post('/component/', auth.checkAuth, function(req, res, next) {
        var body = req.body;

        if (!body.name) {
            Logger.info("Can't insert component: Missing name attribute");
            return res.status(status.NOT_ACCEPTABLE).send({
                "message":"missing name attribute"
            });
        }
        body.status = "open";
        var inv = new Inventory(
            config.app_settings.meta.server,
            {attributes: body.attributes}
        );
        body.inventory = inv.isComplete();

        const instance = new ComponentModel(body);        
        ComponentModel.findOne({name: body.name}, function(err, result) {
            if (err || result) {
                Logger.info("Can't insert component. Duplicate or error! " + JSON.stringify(body)
                       + " REASON: " + err);
                return res.status(status.NOT_ACCEPTABLE).send({});
            }

            instance.save(function(err, item) {
                if (err) {
                    Logger.info("Can't insert component " + JSON.stringify(body)
                           + " REASON: " + err);
                    return res.status(status.NOT_ACCEPTABLE).send({});
                }
                Logger.info("Server inserted: " + JSON.stringify(item));
                return res.status(status.OK).send(item);
            });
        });
    });


    /**
     * @swagger
     * /component/{id}/comment/:
     *   post:
     *     description: Adding a comment to an instance
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Comment added
     *
     */
    app.post('/component/:comp_id/comment/', auth.checkAuth, function(req, res, next) {
        const iid = req.params.comp_id;
        var instanceId = -1;
        
        try {
            instanceId = new ObjectId(iid);
        } catch (ex) {
            Logger.verbose("Invalid ObjectId: " + iid + ". Ex: " + ex);
            return res.status(status.NOT_FOUND).send({"message":"invalid object id"});
        }

        ComponentModel.findOneAndUpdate({
            _id: instanceId
        }, {
            $push: {
                comments: {
                    user_id: req.user._id,
                    username: (req.user.firstname || '') + " " + (req.user.lastname || ''),
                    message: req.body.message || '',
                    reference: req.body.reference || ''
                }
            }
        },
        function(err, instance) {
            if (err) {
                return res.status(status.NOT_FOUND).send({});
            }
            return res.status(status.OK).send(instance);
        });
    });


    /**
     * @swagger
     * /component/:
     *   get:
     *     description: Requesting all component
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all component
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Instance'
     *
     */
    app.get('/component/', auth.checkAuth, function(req, res, next) {
        ComponentModel.find({migrated: false}, null, {sort: {name:1}}, function(err, instances) {
            return res.status(status.OK).send(instances);
        });
    });


    /**
     * @swagger
     * /component/summary/:
     *   get:
     *     description: Requesting summary
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Object
     *         schema:
     *             $ref: '#/definitions/Summary'
     *
     */
    app.get('/component/summary/', auth.checkAuth, function(req, res, next) {
        ComponentModel.aggregate([
            {$match: {migrated: false}},
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
            ComponentModel.count({inventory: true, migrated: false}, function(err, countValid) {
                return res.status(status.OK).send({
                    open: result.open | 0,
                    progress: result.progress | 0,
                    done: result.done | 0,
                    valid: countValid | 0
                });
            });
        });
    });


    /**
     * @swagger
     * /component/status/{status}/:
     *   get:
     *     description: Requesting all component by status
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all component
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Component'
     *
     */
    app.get('/component/status/:status/', auth.checkAuth, function(req, res, next) {
        const _status = req.params.status;

        ComponentModel.find({status: _status, migrated: false}, null, {sort: {name:1}}, function(err, instances) {
            return res.status(status.OK).send(instances);
        });
    });

    /**
     * @swagger
     * /component/migrated/:
     *   get:
     *     description: Requesting all component by status
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all migrated component
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Instance'
     *
     */
    app.get('/component/migrated/', auth.checkAuth, function(req, res, next) {
        const _status = req.params.status;

        ComponentModel.find({status: "done", migrated: true}, null, {sort: {name:1}}, function(err, instances) {
            return res.status(status.OK).send(instances);
        });
    });


    /**
     * @swagger
     * /component/meta/:
     *   get:
     *     description: Requesting component meta info e.g. mandatory fields
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all available meta
     *
     */
    app.get('/component/meta/', auth.checkAuth, function(req, res, next) {
        const mandatory = config.app_settings.meta.server;
        return res.status(status.OK).send(mandatory);
    });


    /**
     * @swagger
     * /component/{id}/:
     *   get:
     *     description: Requesting a component by its ID
     *     tags:
     *       - Component
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all component
     *         schema:
     *           $ref: '#/definitions/Instance'
     *
     */
    app.get('/component/:id/', auth.checkAuth, function(req, res, next) {
        const iid = req.params.id;
        var instanceId = -1;
        
        try {
            instanceId = new ObjectId(iid);
        } catch (ex) {
            Logger.verbose("Invalid ObjectId: " + iid + ". Ex: " + ex);
            return res.status(status.NOT_FOUND).send({"message":"invalid object id"});
        }

        ComponentModel.findOne({_id: instanceId}, function(err, instances) {
            if (err) {
                Logger.verbose("MongoDB error for component " + iid + ": " + ex);
                return res.status(status.NOT_FOUND).send();
            } else if (!instances) {
                Logger.verbose("MongoDB couldn't find component " + iid);
                return res.status(status.NOT_FOUND).send({});
            }
            return res.status(status.OK).send(instances);
        });
    });
};