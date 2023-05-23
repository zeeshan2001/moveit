"use strict";
var Logger       = require('./Logger');
var status       = require('../utils/status');
var JWTProxy     = require('./JWTProxy');


/**
 *  Using as middleware to check auth.
 *  So we can select which endpoints we want the user to be logged in.
 */
module.exports = class Auth {
    static checkAuth(req, res, next) {
        try {
            req.user = JWTProxy.verify(req.cookies.jwt);
        } catch (ex) {
            Logger.info("Ressource needs authentication. " + ex);
            return res.status(status.FORBIDDEN).send({
                message: "Ressource needs authentication."
            });
        }
        next();
    };
};