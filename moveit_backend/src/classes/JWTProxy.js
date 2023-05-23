"use strict";
const fs        = require('fs');
const jwt       = require('jsonwebtoken');
const path      = require('path');
const config    = require('../../src/config');


/**
 *  Class for managing JWT
 */
module.exports = class JWTProxy {
    constructor() {
        
    };


    /**
     *  Just checking if required key files exist.
     *  @return true if they do.
     */
    static secret_exists() {
        try {
            var privateKEY  = fs.readFileSync(
                path.resolve(__dirname, '../secrets/' + config.jwt.private),
                'utf8'
            );
            var publicKEY  = fs.readFileSync(
                path.resolve(__dirname, '../secrets/'  + config.jwt.public),
                'utf8'
            );
            return true;
        } catch (ex) {
            return false;
        }
    };


    /**
     *  Creating a token.
     *  @param payload are data of user we want to encrypt.
     *  @return created token.
     */
    static sign(payload) {
        var privateKEY  = fs.readFileSync(
            path.resolve(__dirname, '../secrets/' + config.jwt.private),
            'utf8'
        );

        var signOptions = config.jwt.options;
        var token = jwt.sign(payload, privateKEY, signOptions);
        return token;
    };


    /**
     *  Verifying token,
     *  @param jwt_token.
     *  @return data stored in token.
     */
    static verify(jwt_token) {
        var publicKEY  = fs.readFileSync(
            path.resolve(__dirname, '../secrets/'  + config.jwt.public),
            'utf8'
        );

        var legit = jwt.verify(jwt_token, publicKEY, config.jwt.options);
        return legit;
    };
};