"use strict";
const status                = require('../utils/status');
const auth                  = require('../classes/Auth.js');
const Logger                = require('../classes/Logger');
const config                = require('../config');
const HistoryModel          = require('../models/history');


module.exports = function(app) {
    /**
     * @swagger
     * /history/{limit}/:
     *   get:
     *     description: Requesting latest history
     *     tags:
     *       - History
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Object
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/History'
     *
     */
    app.get('/history/:start/:count/', auth.checkAuth, function(req, res, next) {
        const limit = req.params.count | 0;
        const skip = req.params.start | 0;

        HistoryModel
            .find({})
            .sort({'createdAt': -1})
            .skip(skip)
            .limit(limit)
            .exec(function(err, posts) {
                if (err) {
                    Logger.verbose("Error: " + err);
                    return res.status(status.STATUS).send({
                        "message":"unexpected error"
                    });
                }
                return res.status(status.OK).send(posts);
        });
    });
};