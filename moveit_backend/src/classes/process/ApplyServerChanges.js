const async               = require("async");
const mongoose            = require('mongoose');
const ObjectId            = require('mongoose').Types.ObjectId; 
const config              = require('../../config');
const Logger              = require('../../classes/Logger');
const ServerFlow          = require('../ServerFlow');
const HistoryModel        = require('../../models/history');
const HistoryTag          = require('../../models/history/tag');
const HistoryType         = require('../../models/history/type');


module.exports = function ApplyServerChanges(user, InstanceModel, server_id,
        workflow, callback) {
    const key = config.app_settings.meta.application.key;
    var server_init = {};

    /**
     *  Important note:
     *  InstanceModel can be server AND component.
     *  Since they are handled same, we use this workflow only.
     */

    async.waterfall([
        // Getting server from DB so we can check whether it's empty.
        function(next) {
            try {
                server_id = new ObjectId(server_id);
            } catch (ex) {
                Logger.info("[ApplyServerChanges]: " + ex);
                return callback(0);
            }

            InstanceModel.findOne({
                _id: server_id,
                migrated: false
            }, function(err, server) {
                if (err || !server) {
                    Logger.error("[ApplyServerChanges]: " + err);
                    return callback(0);
                }
                server_init = JSON.parse(JSON.stringify(server));
                Logger.info("[ApplyServerChanges]: Instances found!");
                next(null, server);
            });
        },
        
        // Set inventory to true if needed.
        function(server, next) {
            var serverFlow = new ServerFlow(server, workflow);
            server.attributes = serverFlow.getAttributes();
            server.workflow = workflow;
            
            // If server hasn't been inventoried but flow says it can be
            if (!server.inventory && serverFlow.isInventored()) {
                server.inventory = true;
                server.save(function(err, savedServer) {
                    if (err) {
                        Logger.error("[ApplyServerChanges]: " + err);
                        return callback(0);
                    }
                    Logger.info("[ApplyServerChanges]: Instance inventory set to true");

                    var history = new HistoryModel({
                        username: ((user.firstname || "")
                            + " " + (user.lastname) || "").trim(),
                        user_id: user._id,
                        instance_name: savedServer.name,
                        type: HistoryType.server,
                        action_tag: HistoryTag.INVENTORY,
                        reference: savedServer._id,
                        item: savedServer
                    });
                    history.save(function(err) {
                        if (err) {
                            Logger.error("Can't write history: "
                                + JSON.stringify(history)
                                + " REASON: " + err);
                        }
                        next(null, savedServer, serverFlow);
                    });
                });
            } else {
                Logger.info("[ApplyServerChanges]: Instance inventory already completed");
                next(null, server, serverFlow);
            }
        },
        
        // Does server have any applications? If yes, leave here.
        function (server, serverFlow, next) {
            server.planned = serverFlow.isPlanned();
            
            if (server.applications && server.applications.length > 0) {
                // If server has any applications,
                // then we'll allow changing its own attributes.
                server.status = serverFlow.getStatus();
                if (server.status === "done") {
                    server.status = "progress";
                }
                if (server.inventory === false) {
                    server.inventory = serverFlow.isInventored();
                }

                server.save(function(err) {
                    if (err) {
                        Logger.error("[ApplyServerChanges]: " + err);
                        return callback(0);
                    }
                    Logger.info("[ApplyServerChanges]: Instance updated workflow ONLY "
                        + "because it's having applications.");
                    return callback(1);
                });
            } else {
                Logger.info("[ApplyServerChanges]: Instance doesn't have any "
                    + "applications. Continue...");
                next(null, server, serverFlow);
            }
        },

        /**
         *  Update changes to server. It's a singleton!
         *  Update and save server instance. EXCEPT:
         *  If server has status done, then first copy the server and save it afterwards.
         */
        function (server, serverFlow, next) {
            server.status = serverFlow.getStatus();
            server.attributes = serverFlow.getAttributes();

            if (server.status === "done") {
                next(null, server, serverFlow);
            } else {
                server.save(function(err, savedServer) {
                    if (err || !savedServer) {
                        Logger.error("[ApplyServerChanges]: " + err);
                        return callback(0);
                    }
                    Logger.info("[ApplyServerChanges]: Instances updated!");

                    var tag = "";
                    switch (server.status) {
                        case "open": {
                            tag = HistoryTag.EDITED;
                            break;
                        }
                        case "progress": {
                            tag = HistoryTag.PLANNED;
                            break;
                        }
                        case "error": {
                            tag = HistoryTag.ERROR;
                        }
                    }
                    if (server.status === server_init.status) {
                        tag = HistoryTag.EDITED;
                    }

                    var history = new HistoryModel({
                        username: ((user.firstname || "")
                            + " " + (user.lastname) || "").trim(),
                        user_id: user._id,
                        instance_name: savedServer.name,
                        type: HistoryType.server,
                        action_tag: tag,
                        reference: savedServer._id,
                        item: savedServer
                    });
                    history.save(function(err) {
                        if (err) {
                            Logger.error("Can't write history: " + JSON.stringify(history)
                                + " REASON: " + err);
                        }
                        return callback(2);
                    });
                });
            }
        },

        // Copy migrated server.
        function (server, serverFlow, next) {
            var new_name = serverFlow.getInstanceNewMigrationName();
            if (!new_name || new_name.length === 0) {
                new_name = server.name;
            }

            InstanceModel.findOne({name: new_name, migrated: true}, function(err, match) {
                if (err) {
                    Logger.error("[ApplyServerChanges]: " + err);
                    return callback(0);
                }
                if (match) {
                    Logger.info("[ApplyServerChanges]: This servername already exists!");
                    return callback(3);
                }
                var newServer = new InstanceModel(JSON.parse(JSON.stringify(server)));
                newServer._id = mongoose.Types.ObjectId();
                newServer.isNew = true;
                newServer.locked = true;
                newServer.status = "done";
                newServer.name = new_name;
                newServer.migrated = true;
                newServer.save(function(err) {
                    if (err) {
                        Logger.error("[ApplyServerChanges]: " + err);
                        return callback(0);
                    }
                    Logger.info("[ApplyServerChanges]: New migrated server created:"
                        + new_name);
                    next(null, server);
                });
            });
        },

        // Set server status to done
        function (server, next) {
            server.locked = true;
            server.status = "done";

            server.save(function(err, savedServer) {
                if (err || !savedServer) {
                    Logger.error("[ApplyServerChanges]: " + err);
                    return callback(0);
                }
                Logger.info("[ApplyServerChanges]: Instances updated "
                    + "after migration/copying!");

                var history = new HistoryModel({
                    username: ((user.firstname || "")
                        + " " + (user.lastname) || "").trim(),
                    user_id: user._id,
                    instance_name: savedServer.name,
                    type: HistoryType.server,
                    action_tag: HistoryTag.MIGRATED,
                    reference: savedServer._id,
                    item: savedServer
                });
                history.save(function(err) {
                    if (err) {
                        Logger.error("Can't write history: " + JSON.stringify(history)
                            + " REASON: " + err);
                    }
                    return callback(2);
                });
            });
        }
    ], callback);
};