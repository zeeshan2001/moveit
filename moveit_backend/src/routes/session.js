"use strict";
const status              = require('../utils/status');
const JWTProxy            = require('../classes/JWTProxy');
const User                = require('../models/user');
const LDAPProxy           = require('../classes/LDAPProxy');
const Logger              = require('../classes/Logger');
const mongoose            = require('mongoose')
const passport            = require("passport");
const auth                = require("../classes/Auth.js");
const bcrypt              = require ("bcrypt");

/**
 *  Endpoints for session management.
 *  Using LDAP API to access them on other server.
 */
module.exports = function(app) {
    /**
     * @swagger
     * /user/session/:
     *   post:
     *     description: Login attemption / Creating a new session for chosen user
     *     tags:
     *       - User
     *     produces:
     *       - application/json
     *
     *     parameters:
     *       - name: username
     *         required: true
     *         type: string
     *       - name: password
     *         required: true
     *         type: string
     *
     *     responses:
     *       202:
     *         description: Object containing user data
     *         schema:
     *            properties:
     *               firstname:
     *                 type: string
     *               lastname:
     *                 type: string
     *               jwttoken:
     *                 type: string
     *       406:
     *         description: Missing parameters or invalid credentials.
     *       404:
     *         description: User not found.
     *       401:
     *         description: Invalid username and/or password.
     *       500:
     *         description: Please see the error log file.
     */
    app.post('/user/session/', function(req, res, next) {
        if (!req.body.username || !req.body.password) {
            Logger.verbose("Missing credentials: Email and password are required.");
            return res.status(status.NOT_ACCEPTABLE).send({
                "message": "Missing credentials: Email and password are required."
            });
        }

        // LDAPProxy.auth(req.body.username, req.body.password, function(result) {
        //     switch (result) {
        //         case 0, 1: {
        //             return res.status(status.ERROR).send({
        //                 "message": "Internal server error. More information can be found in error log file."
        //             });
        //         }
        //         case 2: {
        //             Logger.verbose("User " + req.body.username + "not found.");
        //             return res.status(status.NOT_FOUND).send({
        //                 "message": "User not found."
        //             });
        //         }
        //         case 3: {
        //             Logger.verbose("User " + req.body.username + ": Invalid username and/or password.");
        //             return res.status(status.UNAUTHORIZED).send({
        //                 "message": "Invalid username and/or password."
        //             });
        //         }
        //     }


        //let hash = bcrypt.hashSync('password', 10);
        User.findOne({'email':req.body.username}, function(err, user) {
                // User exists, just give a new session, else create new object.
                if (user) {
                    if(bcrypt.compareSync(req.body.password, user.password)) {
                        
                        user.session = undefined;
                        user.session = JWTProxy.sign(JSON.parse(JSON.stringify(user)));

                        user.save(function(err, item) {
                            if (err) {
                                Logger.info("[Login]: " + user.email + ": " + err);
                                return res.status(status.ERROR).send({});
                            }
                            Logger.info(user.email + " has created a new session");
                            return res.status(status.ACCEPTED).send(item);
                        });
                    } else {
                        Logger.verbose("Passwords misMatch");
                        Logger.verbose(req.body.password, user.password);
                        Logger.verbose("User " + req.body.username + ": Invalid username and/or password.");
                        return res.status(status.UNAUTHORIZED).send({
                            "message": "Invalid username and/or password."
                        });
                    }

                    // var user = new User({
                    //     email: req.body.username,
                    //     lastname: result.cn,
                    //     firstname: result.givenName,
                    //     ldap_uid: result.uid
                    // });
                    // var token = JWTProxy.sign(JSON.parse(JSON.stringify(user)));
                    // user.session = token;
                    //
                    // user.save(function(err, item) {
                    //     if (err) {
                    //         Logger.info("[Login]: " + user.email + ": " + err);
                    //         return res.status(status.ERROR).send({});
                    //     }
                    //     Logger.info(user.email + " has created an account and a session");
                    //     return res.status(status.ACCEPTED).send(user);
                    // });
                }
            });
        // });
    });


    /**
     * @swagger
     * /user/session/:
     *   delete:
     *     description: Requesting own user object
     *     tags:
     *       - User
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Session deleted.
     *       404:
     *         description: Token/User not found or invalid.
     *
     */
     app.delete('/user/session/', auth.checkAuth, function(req, res, next) {

     });
};