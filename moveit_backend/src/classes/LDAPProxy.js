"use strict";
const ldap        = require('ldapjs');
const config      = require('../../src/config');
const logger      = require('./Logger');


/**
 *  Managing LDAP in this class.
 *
 *  LDAP Abbreviations:
 *  CN      commonName
 *  L       localityName
 *  ST      stateOrProvinceName
 *  O       organizationName
 *  OU      organizationalUnitName
 *  C       countryName
 *  STREET  streetAddress
 *  DC      domainComponent
 *  UID     userid
 */
module.exports = class LDAPProxy {
    constructor() {
        LDAPProxy.auth("tesla@ldap.forumsys.com", "password", function(response) {
            console.log(JSON.stringify(response));
        });
    };


    /**
     *  LDAP Auth code. Working steps:
     *     1. Root/admin user logging in
     *     2. Searching for given username to get its domain
     *     3. If user found, logging in and returning its data.
     *
     *  @param username of the user who want to auth.
     *  @param password of the user
     *  @param callback as return function containing one param.
     *  @return defined below:
     *     0: LDAP server connection couldn't be established (ERROR: config file)
     *     1: LDAP: Failed to login for given LDAP user (ERROR: config file, admin!)
     *     2: LDAP search failed. (no matches?)
     *     3: LDAP: User failed to login
     *     else: user object
     */
    static auth(username, password, callback) {
        var client = ldap.createClient({
            url: config.ldap.url
        });
        
        client.on('error', function(err) {
            logger.error("LDAP server connection couldn't be established!");
            callback(0);
            return;
        });

        client.bind(config.ldap.user, config.ldap.password, function (err) {
            if (err && err.lde_message === "Invalid Credentials") {
                logger.error("LDAP: Failed to login for given LDAP user" +
                    "in the config file: " + err);
                callback(1);
                return;
            }
            
            var opt = {
                filter: `(mail=${username})`,
                scope: "sub"
            };

            client.search(config.ldap.search, opt, (err, searchRes) => {
                if (err) {
                    logger.info("LDAP search failed: " + err);
                    callback(2);
                    return;
                }

                searchRes.on("searchEntry", (entry) => {
                    if (entry && entry.objectName) {
                        client.bind(entry.objectName, password, function (err) {
                            if (err && err.lde_message === "Invalid Credentials") {
                                logger.info(`LDAP: User (${entry.objectName}) failed to login: ${err}`);
                                callback(3);
                                return;
                            }
                            client.search(entry.objectName, {}, (err, searchRes) => {
                                searchRes.on("searchEntry", (entry2) => {
                                    callback(entry2.object);
                                });
                            });
                        });
                    }
                });
            });
        });
    };
};