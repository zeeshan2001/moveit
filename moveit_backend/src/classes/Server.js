"use strict";
const config              = require('../config');


/**
 *  Some useful functions for managing server instances.
 */
module.exports = class Server {
    /**
     *  Expecting server object to parse its data.
     *  @param server object
     */
    constructor(server) {
        this.server = server;
        this.applications = server.applications;
        this.key = config.app_settings.meta.application.key;
    };


    /**
     *  Updating an app in code.
     *  @param name of application
     *  @param update is an object containing key value for updating.
     *  @return true if app found, false else.
     */
    updateAppByName(name, update) {
        if (!this.applications) {
            return false;
        }
        for (var i = 0; i < this.applications.length; i++) {
            if (this.applications[i][this.key] === name) {
                const keys = Object.keys(update);
                for (var j = 0; j < keys.length; j++) {
                    this.applications[i][keys[j]] = update[keys[j]];
                }
                return true;
            }
        }
    };


    /**
     *  Getting count of applications
     *  @return count/numeric.
     */
    getAppCount() {
        if (!this.applications) {
            return 0;
        }
        return this.applications.length;
    };


    /**
     *  Getting an app by its name.
     *  @param name of application
     *  @return object if app found, null else
     */
    getAppByName(name) {
        if (!this.applications) {
            return null;
        }
        for (var i = 0; i < this.applications.length; i++) {
            if (this.applications[i][this.key] === name) {
                return this.applications[i];
            }
        }
        return null;
    };


    /**
     *  Removing and returning an application by its given name.
     *  @param name of the app e.g. GIT
     *  @return removed object or null if not found.
     */
    removeAppByName(name) {
        if (!this.applications) {
            return null;
        }
        for (var i = 0; i < this.applications.length; i++) {
            if (this.applications[i][this.key] === name) {
                var tmp = JSON.parse(JSON.stringify(this.applications[i]));
                this.applications.splice(i, 1);
                return tmp;
            }
        }
        return null;
    };


    /**
     *  Adding an application to the server.
     *  @param app object. Probably puleld before somewhere else.
     *  @return inserted object
     */
    addAppToServer(app) {
        if (!this.applications) {
            this.applications = [];
        }
        this.applications.push(app);
        
        const index = this.applications.length - 1;
        return this.applications[index];
    };


    /**
     *  Returning object back.
     *  Probably after editing :)
     */
    getServerObject() {
        return this.server;
    };
};