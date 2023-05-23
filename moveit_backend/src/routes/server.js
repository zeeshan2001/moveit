"use strict";
const auth                = require("../classes/Auth.js");
const ObjectId            = require('mongoose').Types.ObjectId; 
const status              = require('../utils/status');
const Logger              = require('../classes/Logger');
const config              = require('../config');
const InstanceModel       = require('../models/instance');
const HistoryModel        = require('../models/history');
const HistoryTag          = require('../models/history/tag');
const HistoryType         = require('../models/history/type');
const Inventory           = require('../classes/workflow/Inventory');


module.exports = function(app) {
    /**
     * @swagger
     * /server/field/{name}/:
     *   get:
     *     description: Requesting available values of a field. Used for suggestions.
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Array
     *
     */
    app.get('/server/field/:name/', auth.checkAuth, function(req, res, next) {
        const key = req.params.name;
        
        InstanceModel.aggregate([
            {"$project": {
                _id: 0,
                [`${key}`]: "$"+key,
            }}
        ],
        function(err, instances) {
            if (err) {
                Logger.error("/server/field/:name/ ERROR: " + err);
                return res.status(status.ERROR).send({});
            }
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
     * /server/{id}/:
     *   delete:
     *     description: Deleting given server instance
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Server removed
     *
     */
    app.delete('/server/:server_id/', auth.checkAuth, function(req, res, next) {
        const iid = req.params.server_id;
        var instanceId = -1;
        
        try {
            instanceId = new ObjectId(iid);
        } catch (ex) {
            Logger.verbose("Invalid ObjectId: " + iid + ". Ex: " + ex);
            return res.status(status.NOT_FOUND).send({"message":"invalid object id"});
        }

        InstanceModel.findOneAndRemove({_id: instanceId}, function(err, server) {
            if (err) {
                return res.status(status.NOT_FOUND).send({});
            }
            var history = new HistoryModel({
                username: ((req.user.firstname || "")
                    + " " + (req.user.lastname) || "").trim(),
                user_id: req.user._id,
                instance_name: server.name,
                type: HistoryType.server,
                action_tag: HistoryTag.DELETED,
                reference: server._id,
                item: server
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
     * /server/{server_name}/application/:
     *   post:
     *     description: Inserting an application to a server
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Application has been added to server
     *       406:
     *         description: Server key already exist
     *
     */
    app.post('/server/:server_name/application/', auth.checkAuth, function(req, res, next) {
        var body = req.body;
        const server_name = req.params.server_name;

        InstanceModel.findOne({name: server_name, migrated: false}, function(err, server) {
            if (err) {
                Logger.info("Error: " + err);
                return res.status(status.ERROR).send({});
            }
            var instance = null;
            
            // When not found, create
            if (!server) {
                instance = new InstanceModel({
                    status: "open",
                    type: "server",
                    migrated: false,
                    planned: false,
                    inventory: false,
                    attributes: {},
                    applications: [],
                    components: [],
                    comments: [],
                    workflow: {},
                });
            } else {
                instance = new InstanceModel(server);
            }
            instance.name = server_name;
            
            var appToInsert = {};
            appToInsert.app_status = undefined;
            appToInsert.attributes = body;
            appToInsert.app_status = "open";
            appToInsert.migrated = false;
            appToInsert.workflow = {};
            appToInsert.planned = false;
            appToInsert[config.app_settings.meta.application.key]
                = body.name || body.servicename;
            
            if (appToInsert[config.app_settings.meta.application.key].length === 0) {
                return res.status(status.NOT_ACCEPTABLE).send({
                    message: "missing application name"
                });
            }
            
            appToInsert.attributes.name = undefined;
            appToInsert.attributes.servicename = undefined;
            appToInsert.attributes.app_status = undefined;

            var inv = new Inventory(
                config.app_settings.meta.application,
                appToInsert
            );
            appToInsert.inventory = inv.isComplete();


            instance.applications.push(appToInsert);            
            instance.save(function(err, server) {
                if (err) {
                    Logger.info("Can't insert server. REASON: " + err);
                    return res.status(status.NOT_ACCEPTABLE).send({});
                }
                return res.status(status.OK).send(server);
            });
        });
    });


    /**
     * @swagger
     * /server/:
     *   post:
     *     description: Inserting a server
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Server added
     *       406:
     *         description: Server key already exist
     *
     */
    app.post('/server/', auth.checkAuth, function(req, res, next) {
        var body = req.body;

        if (!body.name) {
            Logger.info("Can't insert server: Missing name attribute");
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

        const instance = new InstanceModel(body);        
        InstanceModel.findOne({name: body.name}, function(err, result) {
            if (err || result) {
                Logger.info("Can't insert server. Duplicate or error! " + JSON.stringify(body)
                       + " REASON: " + err);
                return res.status(status.NOT_ACCEPTABLE).send({});
            }

            instance.save(function(err, item) {
                if (err) {
                    Logger.info("Can't insert server " + JSON.stringify(body)
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
     * /server/{id}/comment/:
     *   post:
     *     description: Adding a comment to an instance
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Comment added
     *
     */
    app.post('/server/:server_id/comment/', auth.checkAuth, function(req, res, next) {
        const iid = req.params.server_id;
        var instanceId = -1;
        
        try {
            instanceId = new ObjectId(iid);
        } catch (ex) {
            Logger.verbose("Invalid ObjectId: " + iid + ". Ex: " + ex);
            return res.status(status.NOT_FOUND).send({"message":"invalid object id"});
        }

        InstanceModel.findOneAndUpdate({
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
     * /server/:
     *   get:
     *     description: Requesting all server
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all server
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Instance'
     *
     */
    app.get('/server/', auth.checkAuth, function(req, res, next) {
        InstanceModel.find({type: 'server', migrated: false}, null, {sort: {name:1}}, function(err, instances) {
            return res.status(status.OK).send(instances);
        });
    });


    /**
     * @swagger
     * /server/summary/:
     *   get:
     *     description: Requesting summary
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Object
     *         schema:
     *             $ref: '#/definitions/Summary'
     *
     */
    app.get('/server/summary/', auth.checkAuth, function(req, res, next) {
        InstanceModel.aggregate([
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
            InstanceModel.count({inventory: true, migrated: false}, function(err, countValid) {
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
     * /server/status/{status}/:
     *   get:
     *     description: Requesting all server by status
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all server
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Instance'
     *
     */
    app.get('/server/status/:status/', auth.checkAuth, function(req, res, next) {
        const _status = req.params.status;

        InstanceModel.find({type: 'server', status: _status, migrated: false}, null, {sort: {name:1}}, function(err, instances) {
            return res.status(status.OK).send(instances);
        });
    });

    /**
     * @swagger
     * /server/migrated/:
     *   get:
     *     description: Requesting all server by status
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all migrated server
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Instance'
     *
     */
    app.get('/server/migrated/', auth.checkAuth, function(req, res, next) {
        const _status = req.params.status;

        InstanceModel.find({type: 'server', status: "done", migrated: true}, null, {sort: {name:1}}, function(err, instances) {
            return res.status(status.OK).send(instances);
        });
    });


    /**
     * @swagger
     * /server/meta/:
     *   get:
     *     description: Requesting server meta info e.g. mandatory fields
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all available meta
     *
     */
    app.get('/server/meta/', auth.checkAuth, function(req, res, next) {
        const mandatory = config.app_settings.meta.server;

        return res.status(status.OK).send(mandatory);
    });


    /**
     * @swagger
     * /server/{id}/:
     *   get:
     *     description: Requesting a server by its ID
     *     tags:
     *       - Server
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: List of all server
     *         schema:
     *           $ref: '#/definitions/Instance'
     *
     */
    app.get('/server/:id/', auth.checkAuth, function(req, res, next) {
        const iid = req.params.id;
        var instanceId = -1;
        
        try {
            instanceId = new ObjectId(iid);
        } catch (ex) {
            Logger.verbose("Invalid ObjectId: " + iid + ". Ex: " + ex);
            return res.status(status.NOT_FOUND).send({"message":"invalid object id"});
        }

        InstanceModel.findOne({_id: instanceId}, function(err, instances) {
            if (err) {
                Logger.verbose("MongoDB error for server " + iid + ": " + ex);
                return res.status(status.NOT_FOUND).send();
            } else if (!instances) {
                Logger.verbose("MongoDB couldn't find server " + iid);
                return res.status(status.NOT_FOUND).send({});
            }
            return res.status(status.OK).send(instances);
        });
    });

    app.post('/server/change-verbleib/:id/', auth.checkAuth, function (req, res) {
        const instanceId = req.params.id;

        InstanceModel.findById(instanceId)
          .then(instance => {
              const value = req.body.value;
              let attributes = instance.attributes;
              attributes["verbleib_selected"] = value;
              InstanceModel.findByIdAndUpdate(instanceId, {attributes}, function (err, instance) {
                  if (err) {
                      return res.status(status.ERROR).send(err);
                  }

                  return res.status(status.OK).send("Success");
              })
          })
          .catch(err => {
              return res.status(status.ERROR).send(err.message);
          })
    })

    app.post('/server/change-arbeitspaket/:id/', auth.checkAuth, function (req, res) {
        const instanceId = req.params.id;

        InstanceModel.findById(instanceId)
          .then(instance => {
              const value = req.body.value;
              let attributes = instance.attributes;
              attributes["arbeitspaket_selected"] = value;
              InstanceModel.findByIdAndUpdate(instanceId, {attributes}, function (err, instance) {
                  if (err) {
                      return res.status(status.ERROR).send(err);
                  }

                  return res.status(status.OK).send("Success");
              })
          })
          .catch(err => {
              return res.status(status.ERROR).send(err.message);
          })
    })
};
