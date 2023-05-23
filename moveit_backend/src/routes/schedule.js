"use strict";
const async                 = require('async');
const status                = require('../utils/status');
const auth                  = require('../classes/Auth.js');
const Logger                = require('../classes/Logger');
const config                = require('../config');
const InstanceModel         = require('../models/instance');
const ComponentModel        = require('../models/component');


module.exports = function(app) {
    /**
     * @swagger
     * /schedule/server/{year}/{month}/:
     *   get:
     *     description: Getting current schedule (next planned tasks)
     *     tags:
     *       - Schedule
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: month
     *         required: true
     *         type: string
     *       - name: year
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Object
     *
     */
    app.get('/schedule/server/:year/:month/', auth.checkAuth, function(req, res, next) {
        const year = req.params.year;
        const month = req.params.month;

        var firstDay = new Date(year, month - 1, 0);
        firstDay.setUTCHours(23);
        firstDay.setMinutes(59);
        firstDay.setSeconds(59);
        var lastDay = new Date(year, month, 1);
        lastDay.setUTCHours(23);
        lastDay.setMinutes(59);
        lastDay.setSeconds(59);

        async.waterfall([
            function(next) {
                var content = {};
                content.starting = {};
                content.ending = {};
                next(null, content);
            },
            function(content, next) {
                InstanceModel.aggregate([
                    {$match: {
                        planned: true,
                        migrated: false,
                        status: {$ne: "done"},
                        'workflow.planning_start.date': {
                            "$gte": firstDay,
                            "$lte": lastDay
                        }
                    }},
                    {$group: {
                        _id : {
                            day:{$dayOfMonth:'$workflow.planning_start.date'},
                            date: '$workflow.planning_start.date'
                        },
                        count:{$sum: 1 }
                    }},
                    {$project: {
                        day: "$_id.day",
                        count: "$count",
                        _id: 0
                    }}
                ],
                function(err, server) {
                    content.starting = {};
                    for (var i = 0; i < server.length; i++) {
                        content.starting[server[i].day] = server[i].count;
                    }
                    next(null, content);
                });
            },
            function(content, next) {
                InstanceModel.aggregate([
                    {$match: {
                        planned: true,
                        migrated: false,
                        status: {$ne: "done"},
                        'workflow.planning_end.date': {
                            "$gte": firstDay,
                            "$lte": lastDay
                        }
                    }},
                    {$group: {
                        _id : {
                            day:{$dayOfMonth:'$workflow.planning_end.date'},
                            date: '$workflow.planning_end.date'
                        },
                        count:{$sum: 1 }
                    }},
                    {$project: {
                        day: "$_id.day",
                        count: "$count",
                        _id: 0
                    }}
                ],
                function(err, server) {
                    content.ending = {};
                    for (var i = 0; i < server.length; i++) {
                        content.ending[server[i].day] = server[i].count;
                    }
                    next(content);
                });
            },
        ], function(content) {
            content.meta = {};
            content.meta.year = year;
            content.meta.month = month;
            return res.send(content);
        });
    });


    /**
     * @swagger
     * /schedule/app/{year}/{month}/:
     *   get:
     *     description: Getting current schedule (next planned tasks)
     *     tags:
     *       - Schedule
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: month
     *         required: true
     *         type: string
     *       - name: year
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Object
     *
     */
    app.get('/schedule/app/:year/:month/', auth.checkAuth, function(req, res, next) {
        const year = req.params.year;
        const month = req.params.month;
        var firstDay = new Date(year, month - 1, 0);
        firstDay.setUTCHours(23);
        firstDay.setMinutes(59);
        firstDay.setSeconds(59);
        var lastDay = new Date(year, month, 1);
        lastDay.setUTCHours(23);
        lastDay.setMinutes(59);
        lastDay.setSeconds(59);


        async.waterfall([
            function(next) {
                var content = {};
                content.starting = {};
                content.ending = {};
                next(null, content);
            },
            function(content, next) {              
                InstanceModel.aggregate([
                    {"$unwind": "$applications"},
                    {"$project": {
                        '_id': 0,
                        'name': '$applications.servicename',
                        'start': '$applications.workflow.planning_start.date',
                        'end': '$applications.workflow.planning_end.date',
                        'status': '$applications.status',
                        'migrated': '$applications.migrated',
                        'planned': '$applications.planned'
                    }},
                    {$match: {
                        planned: true,
                        migrated: false,
                        status: {$ne: "done"},
                        start: {
                            "$gte": firstDay,
                            "$lte": lastDay
                        }
                    }},
                    {$group: {
                        _id : {
                            day:{$dayOfMonth:'$start'}
                        },
                        count:{$sum: 1 }
                    }},
                    {"$project": {
                        _id: 0,
                        day: "$_id.day",
                        count: 1
                    }}
                ],
                function(err, server) {
                    content.starting = {};
                    for (var i = 0; i < server.length; i++) {
                        content.starting[server[i].day] = server[i].count;
                    }
                    next(null, content);
                });
            },
            function(content, next) {
                InstanceModel.aggregate([
                    {"$unwind": "$applications"},
                    {"$project": {
                        '_id': 0,
                        'name': '$applications.servicename',
                        'start': '$applications.workflow.planning_start.date',
                        'end': '$applications.workflow.planning_end.date',
                        'status': '$applications.status',
                        'migrated': '$applications.migrated',
                        'planned': '$applications.planned'
                    }},
                    {$match: {
                        planned: true,
                        migrated: false,
                        status: {$ne: "done"},
                        end: {
                            "$gte": firstDay,
                            "$lte": lastDay
                        }
                    }},
                    {$group: {
                        _id : {
                            day:{$dayOfMonth:'$end'}
                        },
                        count:{$sum: 1 }
                    }},
                    {"$project": {
                        _id: 0,
                        day: "$_id.day",
                        count: 1
                    }}
                ],
                function(err, server) {
                    content.ending = {};
                    for (var i = 0; i < server.length; i++) {
                        content.ending[server[i].day] = server[i].count;
                    }
                    next(content);
                });
            },
        ], function(content) {
            content.meta = {};
            content.meta.year = year;
            content.meta.month = month;
            return res.send(content);
        });
    });


    /**
     * @swagger
     * /schedule/component/{year}/{month}/:
     *   get:
     *     description: Getting current schedule (next planned tasks)
     *     tags:
     *       - Schedule
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: month
     *         required: true
     *         type: string
     *       - name: year
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Object
     *
     */
    app.get('/schedule/component/:year/:month/', auth.checkAuth,
            function(req, res, next) {
        const year = req.params.year;
        const month = req.params.month;

        var firstDay = new Date(year, month - 1, 0);
        firstDay.setUTCHours(23);
        firstDay.setMinutes(59);
        firstDay.setSeconds(59);
        var lastDay = new Date(year, month, 1);
        lastDay.setUTCHours(23);
        lastDay.setMinutes(59);
        lastDay.setSeconds(59);

        async.waterfall([
            function(next) {
                var content = {};
                content.starting = {};
                content.ending = {};
                next(null, content);
            },
            function(content, next) {
                ComponentModel.aggregate([
                    {$match: {
                        planned: true,
                        migrated: false,
                        status: {$ne: "done"},
                        'workflow.planning_start.date': {
                            "$gte": firstDay,
                            "$lte": lastDay
                        }
                    }},
                    {$group: {
                        _id : {
                            day:{$dayOfMonth:'$workflow.planning_start.date'},
                            date: '$workflow.planning_start.date'
                        },
                        count:{$sum: 1 }
                    }},
                    {$project: {
                        day: "$_id.day",
                        count: "$count",
                        _id: 0
                    }}
                ],
                function(err, server) {
                    content.starting = {};
                    for (var i = 0; i < server.length; i++) {
                        content.starting[server[i].day] = server[i].count;
                    }
                    next(null, content);
                });
            },
            function(content, next) {
                ComponentModel.aggregate([
                    {$match: {
                        planned: true,
                        migrated: false,
                        status: {$ne: "done"},
                        'workflow.planning_end.date': {
                            "$gte": firstDay,
                            "$lte": lastDay
                        }
                    }},
                    {$group: {
                        _id : {
                            day:{$dayOfMonth:'$workflow.planning_end.date'},
                            date: '$workflow.planning_end.date'
                        },
                        count:{$sum: 1 }
                    }},
                    {$project: {
                        day: "$_id.day",
                        count: "$count",
                        _id: 0
                    }}
                ],
                function(err, server) {
                    content.ending = {};
                    for (var i = 0; i < server.length; i++) {
                        content.ending[server[i].day] = server[i].count;
                    }
                    next(content);
                });
            },
        ], function(content) {
            content.meta = {};
            content.meta.year = year;
            content.meta.month = month;
            return res.send(content);
        });
    });


    /**
     * @swagger
     * /schedule/{type}/{year}/{month}/{day}/:
     *   get:
     *     description: Getting current schedule (next planned tasks)
     *     tags:
     *       - Schedule
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: type
     *         required: true
     *         description: server, component, app
     *         type: string
     *       - name: month
     *         required: true
     *         type: string
     *       - name: year
     *         required: true
     *         type: string
     *       - name: day
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Object
     *
     */
    app.get('/schedule/server/:year/:month/:day/', auth.checkAuth,
    function(req, res, next) {
        const year = req.params.year | 0;
        const month = req.params.month | 0;
        const day = req.params.day | 0;
        var firstDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        firstDay.setDate(day);
        firstDay.setHours(0);
        var lastDay = new Date(firstDay);
        lastDay.setDate(day + 1);

        InstanceModel.aggregate([
            {$match: {
                planned: true,
                migrated: false,
                status: {$ne: "done"},
                'workflow.planning_start.date': {
                    "$gte": firstDay,
                    "$lte": lastDay
                }
            }}
        ],
        function(err, serverStart) {
            InstanceModel.aggregate([
                {$match: {
                    planned: true,
                    migrated: false,
                    status: {$ne: "done"},
                    'workflow.planning_end.date': {
                        "$gte": firstDay,
                        "$lte": lastDay
                    }
                }}
            ],
            function(err, serverEnd) {
                return res.send({
                    start: serverStart,
                    end: serverEnd
                });
            });
        });
    });


    app.get('/schedule/component/:year/:month/:day/', auth.checkAuth,
            function(req, res, next) {
        const year = req.params.year | 0;
        const month = req.params.month | 0;
        const day = req.params.day | 0;
        var firstDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        firstDay.setDate(day);
        firstDay.setHours(0);
        var lastDay = new Date(firstDay);
        lastDay.setDate(day + 1);

        ComponentModel.aggregate([
            {$match: {
                planned: true,
                migrated: false,
                status: {$ne: "done"},
                'workflow.planning_start.date': {
                    "$gte": firstDay,
                    "$lte": lastDay
                }
            }}
        ],
        function(err, serverStart) {
            ComponentModel.aggregate([
                {$match: {
                    planned: true,
                    migrated: false,
                    status: {$ne: "done"},
                    'workflow.planning_end.date': {
                        "$gte": firstDay,
                        "$lte": lastDay
                    }
                }}
            ],
            function(err, serverEnd) {
                return res.send({
                    start: serverStart,
                    end: serverEnd
                });
            });
        });
    });


    app.get('/schedule/app/:year/:month/:day/', auth.checkAuth,
            function(req, res, next) {
        const year = req.params.year | 0;
        const month = req.params.month | 0;
        const day = req.params.day | 0;
        var firstDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        firstDay.setDate(day);
        firstDay.setHours(0);
        var lastDay = new Date(firstDay);
        lastDay.setDate(day + 1);

        InstanceModel.aggregate([
            {"$unwind": "$applications"},
            {"$project": {
                '_id': 0,
                'name': '$applications.servicename',
                'start': '$applications.workflow.planning_start.date',
                'end': '$applications.workflow.planning_end.date',
                'status': '$applications.status',
                'migrated': '$applications.migrated',
                'planned': '$applications.planned'
            }},
            {$match: {
                planned: true,
                migrated: false,
                status: {$ne: "done"},
                start: {
                    "$gte": firstDay,
                    "$lte": lastDay
                }
            }},
            {$group: {
                _id : {
                    name: '$name'
                },
                count:{$sum: 1 }
            }},
            {"$project": {
                _id: 0,
                servicename: "$_id.name",
                count: 1
            }}
        ],
        function(err, appStart) {
            InstanceModel.aggregate([
                {"$unwind": "$applications"},
                {"$project": {
                    '_id': 0,
                    'name': '$applications.servicename',
                    'start': '$applications.workflow.planning_start.date',
                    'end': '$applications.workflow.planning_end.date',
                    'status': '$applications.status',
                    'migrated': '$applications.migrated',
                    'planned': '$applications.planned'
                }},
                {$match: {
                    planned: true,
                    migrated: false,
                    status: {$ne: "done"},
                    end: {
                        "$gte": firstDay,
                        "$lte": lastDay
                    }
                }},
                {$group: {
                    _id : {
                        name: '$name'
                    },
                    count:{$sum: 1 }
                }},
                {"$project": {
                    _id: 0,
                    servicename: "$_id.name",
                    count: 1
                }}
            ], function(err, appEnd) {
                return res.send({
                    start: appStart,
                    end: appEnd
                });
            });
        });
    });
};