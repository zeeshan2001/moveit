const async               = require("async");
const mongoose            = require('mongoose');
const ObjectId            = require('mongoose').Types.ObjectId; 
const config              = require('../../config');
const Logger              = require('../../classes/Logger');
const InstanceModel       = require('../../models/instance');
const ServerFlow          = require('../ServerFlow');
const ItemFlow            = require('../ItemFlow');
const ServerClass         = require('../Server');
const HistoryModel        = require('../../models/history');
const HistoryTag          = require('../../models/history/tag');
const HistoryType         = require('../../models/history/type');


module.exports = function ApplyApplicationChanges(user, server_id, app_name,
    applicationFlow, callback) {
    const key = config.app_settings.meta.application.key;
    var appFlow = new ItemFlow(applicationFlow, "applications");
    var app_init = {};

    try {
        server_id = new ObjectId(server_id);
    } catch (ex) {
        Logger.error("[ApplyServerChanges]: " + ex);
        return callback(0);
    }

    async.waterfall([
        /**
         *  Getting app init state for comparing later.
         */
        function (next) {
            InstanceModel.findOne({
                _id: server_id,
                migrated: false,
                [`applications.${key}`]: app_name
            }, function(err, server) {
                if (server.applications && server.applications.length > 0) {
                    for (var i = 0; i < server.applications.length; i++) {
                        if (server.applications[i].servicename === app_name) {
                            app_init = server.applications[i];
                            break;
                        }
                    }
                }
                next();
            });
        },


        /**
         *  An application has its own attributes.
         *  Thus we update a single application first.
         */
        function (next) {
            InstanceModel.findOneAndUpdate({
                _id: server_id,
                migrated: false,
                [`applications.${key}`]: app_name
            }, {
                $set: {
                    'applications.$.attributes': appFlow.getAttributes(),
                    'applications.$.inventory': appFlow.isInventored()
                }
            },
            function(err) {
                if (err) {
                    Logger.error("[ApplyApplicationChanges]: " + err);
                    return callback(0);
                }
                Logger.info("[ApplyApplicationChanges]: Instance "
                    +"attributes updated!");
                
                if (appFlow.isPlanned() || appFlow.getStatus() === "error") {
                    next();
                } else {
                    return callback(2);
                }
            });
        },


        /**
         *  Getting all servers which host the given application.
         */
        function(next) {
            InstanceModel.find({
                [`applications.${key}`]: app_name,
                migrated: false
            }, function(err, servers) {
                if (err || !servers) {
                    Logger.error("[ApplyApplicationChanges]: " + err);
                    return callback(0);
                }

                Logger.info("[ApplyApplicationChanges]: Instances found!");
                next(null, servers);
            });
        },


        /**
         *  Validating the matching servers:
         *  Checking if all servers have been inventored so we can continue.
         *  Else: Leave here.
         */
        function(servers, next) {
            var serverFlowObjects = [];
            var isAppPlanned = appFlow.isPlanned();

            for (var i = 0; i < servers.length; i++) {
                if (!servers[i].inventory) {
                    Logger.info("[ApplyApplicationChanges]: Server "
                        + servers[i].name + " need to be inventored!");
                    return callback(1);
                }
                var _server = new ServerClass(servers[i]);
                var _app = _server.getAppByName(app_name);

                /**
                 *  If user is requesting more than inventory then we stop him here If
                 *  There are still apps which haven't been inventored yet.
                 */
                if (!_app.inventory && isAppPlanned) {
                    Logger.info("[ApplyApplicationChanges]: Server "
                        + servers[i].name + " application needs to be inventored!");
                    return callback(4);
                }
            };
            Logger.info("[ApplyApplicationChanges]: All servers "
                + "have been inventored!");
            next(null, servers);
        },


        /**
         *  Updating all applications on their hosts.
         *  Changing application data here and saving back to the db.
         */
        function (servers, next) {
            async.eachSeries(servers, function(server, done) {
                var serverTmp = new ServerClass(server);
                serverTmp.updateAppByName(app_name, {
                    workflow: applicationFlow,
                    planned: appFlow.isPlanned(),
                    app_status: appFlow.getStatus()
                });
                
                // Getting flow after editing current application.
                server = serverTmp.getServerObject();
                var serverFlow = new ServerFlow(server);
                server.planned = serverFlow.isPlanned();

                // If once a server is in progress, it can't be open again.
                if (server.status !== "open" && serverFlow.getStatus() === "open") {
                    server.status = "progress";
                } else {
                    server.status = serverFlow.getStatus();
                }
                if (appFlow.hasError()) {
                    server.status = "error";
                }

                server.save(function(err) {
                    if (err) {
                        Logger.error("[ApplyApplicationChanges]: " + err);
                        return callback(0);
                    }
                    Logger.info("[ApplyApplicationChanges]: Updated " + server.name);
                    done();
                });
            }, function allDone (err) {
                if (err) {
                    Logger.error("[ApplyApplicationChanges]: " + err);
                    return callback(0);
                }
                Logger.info("[ApplyApplicationChanges]: Servers and apps "
                    +"have been updated!");

                ////////////////////////////////////////////////////
                ////////////////////////////////////////////////////
                var tag = "";
                console.log(appFlow.getStatus(), app_init.app_status);
                if (appFlow.getStatus() === app_init.app_status
                        && appFlow.getStatus() !== "done") {
                    tag = HistoryTag.EDITED;
                } else {
                    if (app_init.app_status == "open" && appFlow.getStatus() == "progress") {
                        tag = HistoryTag.PLANNED;
                    } else if (appFlow.getStatus() === "error") {
                        tag = HistoryTag.ERROR;
                    }
                }
                if (tag !== "") {
                    var history = new HistoryModel({
                        username: ((user.firstname || "")
                            + " " + (user.lastname) || "").trim(),
                        user_id: user._id,
                        instance_name: app_name,
                        type: HistoryType.application,
                        action_tag: tag,
                        reference: null,
                        item: applicationFlow
                    });
                    history.save(function(err) {
                        if (err) {
                            Logger.error("Can't write history: " + JSON.stringify(history)
                                + " REASON: " + err);
                        }

                        if (appFlow.getStatus() !== "done") {
                            return callback(2);
                        }
                        Logger.info("[ApplyApplicationChanges]: Starting "
                            +"migration/copying process...");
                        next();
                    });
                } else {
                    next();
                }
                ////////////////////////////////////////////////////
                ////////////////////////////////////////////////////
            });
        },

 
        /**
         *  Getting all servers which host the given application.
         */
        function(next) {
            InstanceModel.find({
                [`applications.${key}`]: app_name,
                migrated: false
            }, function(err, servers) {
                if (err || !servers) {
                    Logger.error("[ApplyApplicationChanges]: " + err);
                    return callback(0);
                }

                Logger.info("[ApplyApplicationChanges]: Instances found (again)!");
                next(null, servers);
            });
        },


        /**
         *  Migrating/Copying process here.
         */
        function (servers, next) {
            async.eachSeries(servers, function(server, done) {
                async.waterfall([
                    // Preparing data
                    function(next) {
                        var currentServer = new ServerClass(server);
                        var currentApp = currentServer.removeAppByName(app_name);
                        currentApp.migrated = true;
                        currentApp._id = mongoose.Types.ObjectId();
                        currentApp.isNew = true;
                        next(null, currentServer.getServerObject(), currentApp);
                    },
                    
                    // Update and save current(old) server
                    function(currentServer, currentApp, next) {
                        var serverFlow = new ServerFlow(currentServer);
                        currentServer.planned = serverFlow.isPlanned();
                        currentServer.status = serverFlow.getStatus();
                        if (currentServer.status === "open") {
                            currentServer.status = "progress";
                        }
                        currentServer.save(function(err, savedServer) {
                            if (err) {
                                Logger.error("[ApplyApplicationChanges]: " + err);
                                return callback(0);
                            }
                            Logger.info("[ApplyApplicationChanges]: Updated old server ");
                            next(null, savedServer, currentApp);
                        });
                    },
                    
                    // Inserting app to new server
                    function(currentServer, currentApp, next) {
                        var newName = appFlow.getInstanceNewMigrationName(currentServer.name);
                        if (!newName || newName === "") {
                            newName = currentServer.name;
                        }
                        InstanceModel.findOne({name: newName, migrated: true},
                        function(err, match) {
                            if (err) {
                                Logger.error("[ApplyApplicationChanges]: " + err);
                                return callback(0);
                            }
                            var newServer = null;
                            if (match) {
                                newServer = match;
                            } else {
                                newServer = new InstanceModel(
                                    JSON.parse(JSON.stringify(currentServer))
                                );
                                newServer.applications = [];
                                newServer.comments = [];
                                newServer._id = mongoose.Types.ObjectId();
                                newServer.isNew = true;
                            }
                            var tmp = new ServerClass(newServer);
                            tmp.addAppToServer(currentApp);
                            newServer = tmp.getServerObject();
                            newServer.migrated = true;
                            newServer.status = "done";
                            newServer.name = newName;
                            newServer.save(function(err) {
                                if (err) {
                                    Logger.error("[ApplyApplicationChanges]: " + err);
                                    return callback(0);
                                }
                                Logger.info("[ApplyApplicationChanges]: Inserted/Updated new server");
                                
                                if (currentServer.applications.length === 0) {
                                    InstanceModel.findOneAndUpdate({
                                        _id: currentServer._id
                                    }, {
                                        $set: {
                                        status: "done",
                                        planned: true,
                                        migrated: false,
                                        inventory: true,
                                        locked: true
                                    }}, function(err) {
                                        if (err) {
                                            Logger.error("[ApplyApplicationChanges]: " + err);
                                            return callback(0);
                                        }
                                        Logger.info("[ApplyApplicationChanges]: Old server closed: No applications.");
                                        next(null);
                                    });
                                } else {
                                    next(null);
                                }
                            })
                        });
                    }
                ], function(code) {
                    Logger.info("[ApplyApplicationChanges]: Server copied/migrated!");
                    done();
                });
            },
            function allDone (err) {
                if (err) {
                    Logger.error("[ApplyApplicationChanges]: " + err);
                    return callback(0);
                }
                Logger.info("[ApplyApplicationChanges]: Servers and apps "
                    +"have been updated!");
                
                ////////////////////////////////////////////////////
                ////////////////////////////////////////////////////
                var history = new HistoryModel({
                    username: ((user.firstname || "")
                        + " " + (user.lastname) || "").trim(),
                    user_id: user._id,
                    instance_name: app_name,
                    type: HistoryType.application,
                    action_tag: HistoryTag.MIGRATED,
                    reference: null,
                    item: applicationFlow
                });
                history.save(function(err) {
                    if (err) {
                        Logger.error("Can't write history: " + JSON.stringify(history)
                            + " REASON: " + err);
                    }
                    Logger.info("[ApplyApplicationChanges]: Starting "
                        +"migration/copying process...");
                    return callback(3);
                });
                ////////////////////////////////////////////////////
                ////////////////////////////////////////////////////
            });
        }
    ], callback);
};