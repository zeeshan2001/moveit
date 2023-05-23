"use strict";
const status              = require('../utils/status');
const JWTProxy            = require('../classes/JWTProxy');
const User                = require('../models/user');
const LDAPProxy           = require('../classes/LDAPProxy');
const Logger              = require('../classes/Logger');
const mongoose            = require('mongoose')
const auth                = require("../classes/Auth.js");


/**
 *  Endpoints for user management.
 */
module.exports = function(app) {
    /**
     * @swagger
     * /user/self/:
     *   get:
     *     description: Requesting own user object
     *     tags:
     *       - User
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Object containing users own data
     *         schema:
     *           $ref: '#/definitions/User'
     *
     */
    app.get('/user/self/', auth.checkAuth, function(req, res, next) {
        return res.send(req.user);
    });
};