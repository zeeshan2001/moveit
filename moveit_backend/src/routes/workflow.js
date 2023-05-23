"use strict";
const status              = require('../utils/status');
const Logger              = require('../classes/Logger');
const mongoose            = require('mongoose');
const auth                = require("../classes/Auth.js");
const workflowModel       = require('../models/workflow');
const ObjectId            = require('mongoose').Types.ObjectId; 
const InstanceModel       = require('../models/instance');
const ComponentModel      = require('../models/component');
const config              = require('../config');
const async               = require("async");
const FlowManager         = require('../classes/FlowManager');
const ItemFlow            = require('../classes/ItemFlow');



module.exports = function(app) {
    /**
     * @swagger
     * /workflow/{category}/:
     *   get:
     *     description: Requesting workflow for desired category.
     *     tags:
     *       - Workflow
     *     produces:
     *       - application/json
     *
     */
    app.get('/workflow/:category/', auth.checkAuth, function(req, res, next) {

        var results = [];
        var category = req.params.category;

        for (var i = 0; i < workflowModel.length; i++) {
            if (!workflowModel[i].restrict || workflowModel[i].restrict === category) {
                results.push(workflowModel[i]);
            }
        }
        return res.status(status.OK).send(results);
    });


    /**
     * @swagger
     * /workflow/:
     *   get:
     *     description: Requesting ALL possible workflow elements
     *     tags:
     *       - Workflow
     *     produces:
     *       - application/json
     *
     */
    app.get('/workflow/', auth.checkAuth, function(req, res, next) {
        return res.status(status.OK).send(workflowModel);
    });


    /**
     * @swagger
     * /workflow/server/migrate/:
     *   get:
     *     description: Migrating or updating a server
     *     tags:
     *       - Workflow
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: server_id
     *         type: string
     *         description: root element
     *       - name: workflow
     *         type: string
     *         description: e.g. application or component
     *
     */
    app.post('/workflow/server/migrate/', auth.checkAuth, function(req, res, next) {
        var server_id = req.body.server_id;
        var item_workflow = req.body.workflow || {};

        FlowManager.applyServerChanges(req.user, InstanceModel, server_id, item_workflow, function(code) {
            switch (code) {
                case 1: {
                    return res.status(status.OK).send({
                        code: 1,
                        message: 'Server has applications. Only attributes has been '
                        +'updated and inventoried.'
                    });
                    break;
                }
                case 2: {
                    return res.status(status.OK).send({
                        code: 2,
                        message: 'Server has been updated and status has been changed.'
                    });
                    break;
                }
                case 3: {
                    return res.status(status.NOT_ACCEPTABLE).send({
                        code: 3,
                        message: 'The given new name already exists!'
                    });
                    break;
                }
                case 4: {
                    return res.status(status.OK).send({
                        code: 4,
                        message: 'Server has been updated and migrated successfully.'
                    });
                    break;
                }
                default: {
                    return res.status(status.ERROR).send({
                        code: 0,
                        message: 'Unknown error!'
                    });
                    break;
                }
            }
        });
    });


    /**
     * @swagger
     * /workflow/component/migrate/:
     *   get:
     *     description: Migrating or updating a component
     *     tags:
     *       - Workflow
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: server_id
     *         type: string
     *         description: root element
     *       - name: workflow
     *         type: string
     *         description: e.g. application or component
     *
     */
    app.post('/workflow/component/migrate/', auth.checkAuth, function(req, res, next) {
        var server_id = req.body.server_id;
        var item_workflow = req.body.workflow || {};

        FlowManager.applyServerChanges(req.user, ComponentModel, server_id, item_workflow, function(code) {
            switch (code) {
                case 1: {
                    return res.status(status.OK).send({
                        code: 1,
                        message: 'Component has applications. Only attributes has been '
                        +'updated and inventoried.'
                    });
                    break;
                }
                case 2: {
                    return res.status(status.OK).send({
                        code: 2,
                        message: 'Component has been updated and status has been changed.'
                    });
                    break;
                }
                case 3: {
                    return res.status(status.NOT_ACCEPTABLE).send({
                        code: 3,
                        message: 'The given new name already exists!'
                    });
                    break;
                }
                case 4: {
                    return res.status(status.OK).send({
                        code: 4,
                        message: 'Component has been updated and migrated successfully.'
                    });
                    break;
                }
                default: {
                    return res.status(status.ERROR).send({
                        code: 0,
                        message: 'Unknown error!'
                    });
                    break;
                }
            }
        });
    });


    /**
     * @swagger
     * /workflow/application/migrate/:
     *   get:
     *     description: Migrating or updating an application
     *     tags:
     *       - Workflow
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: server_id
     *         type: string
     *         description: root element
     *       - name: workflow
     *         type: string
     *         description: e.g. application or component
     *
     */
    app.post('/workflow/application/migrate/', auth.checkAuth, function(req, res, next) {
        var server_id = req.body.server_id;
        var item_name = req.body.item_name;
        var item_workflow = req.body.workflow || {};

        FlowManager.applyApplicationChanges(req.user, server_id, item_name, item_workflow, 
        function(code) {
            switch (code) {
                case 1: {
                    return res.status(status.NOT_ACCEPTABLE).send({
                        code: 1,
                        message: '',
                        servicename: item_name
                    });
                }
                case 2: {
                    return res.status(status.OK).send({
                        code: 2,
                        message: 'Servers and apps have been updated.',
                        servicename: item_name
                    });
                    break;
                }
                case 3: {
                    return res.status(status.OK).send({
                        code: 3,
                        message: 'Servers and apps have been updated and migrated.',
                        servicename: item_name
                    });
                    break;
                }
                case 4: {
                    return res.status(status.NOT_ACCEPTABLE).send({
                        code: 4,
                        message: '',
                        servicename: item_name
                    });
                }
                default: {
                    return res.status(status.ERROR).send({
                        code: 0,
                        message: 'Unknown error!',
                        servicename: item_name
                    });
                    break;
                }
            }
        });
    });
};