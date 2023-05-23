"use strict";
const config              = require('../config');
const ItemFlow            = require('./ItemFlow');
const Workflow            = require('../classes/workflow/Workflow');
const Planning            = require('../classes/workflow/Planning');
const Migration           = require('../classes/workflow/Migration');
const Inventory           = require('../classes/workflow/Inventory');


module.exports = class ServerFlow {
    /**
     *  Expexting two parameters.
     *  @param server is server instance.
     *  @param serverWorkFlow is of current workflow we got from request.
     */
    constructor(server, newServerWorkFlow) {
        this.server           = server;
        this.meta             = config.app_settings.meta.server;
        this.serverWorkflow   = server.workflow;
        this.applications     = [];
        this.selfFlow         = new ItemFlow(newServerWorkFlow, "server");
        this.initAppFlows(server.applications);
    };


    /**
     *  We care about workflows. So let's take it for the apps.
     *  Since a server is depending on its applications this part is important.
     *  @param applications form an instance
     */
    initAppFlows(apps) {
        var apps = apps || [];
        for (var i = 0; i < apps.length; i++) {
            this.applications.push(new ItemFlow(apps[i].workflow));
        }
    };



    /**
     *  Just checking if a server has any applications.
     *  This is important since server with applications have limited rights.
     *  @return true if yes, else false.
     */
    hasApplications() {
        return (this.applications.length !== 0);
    };


    /**
     *  Server can be inventored without anything else.
     *  No applications needed. Always allowed.
     *  @return true if yes, else false.
     */
    isInventored() {
        if (!this.serverWorkflow) {
            return false;
        }
        return this.selfFlow.isInventored();
    };


    /**
     *  Checking if a server is planned.
     *  A server with applications is depending on them.
     *  @return true if yes, else false.
     */
    isPlanned() {
        if (this.hasApplications() === true) {
            for (var i = 0; i < this.applications.length; i++) {
                if (this.applications[i].isPlanned() === true) {
                    return true;
                }
            }
            return false;
        } else {
            return this.selfFlow.isPlanned();
        }
    };


    /**
     *  Checking if a server is migrated.
     *  A server with applications is depending on them.
     *  @return true if yes, else false.
     */
    isMigrated() {
        if (this.hasApplications() === true) {
            for (var i = 0; i < this.applications.length; i++) {
                if (this.applications[i].isMigrated() === false) {
                    return false;
                }
            }
            return true;
        }
        return this.selfFlow.isMigrated();
    };


    /**
     *  Getting attributes of current workflow which we want to set.
     *  @return object containing attributes.
     */
    getAttributes() {
        return this.selfFlow.getAttributes();
    };


    /**
     *  Getting key of chosen instance
     *  @return e.g. name/servicename
     */
    getKey() {
        return this.selfFlow.getKey();
    };


    /**
     *  Getting the new name of an instance to be migrated.
     *  @return new_name: desired new name of server.
     */
    getInstanceNewMigrationName() {
        return this.selfFlow.getInstanceNewMigrationName(this.server.name);
    };


    /**
     *  Checking if a server has any errors.
     *  A server with applications is depending also on them.
     *  @return true if yes, else false.
     */
    hasError() {
        if (this.hasApplications() === true) {
            for (var i = 0; i < this.applications.length; i++) {
                if (this.applications[i].hasError() === true) {
                    return true;
                }
            }
            return false;
        }
        return this.selfFlow.hasError();
    };


    /**
     *  Getting status of the server.
     *  A server with applications is depending also on them.
     *  @return true if yes, else false.
     */
    getStatus() {
        if (this.hasApplications()) {
            if (this.hasError() === true) {
                return "error";
            }
            if (this.isMigrated() === true) {
                return "done";
            }
            if (this.isPlanned() === true) {
                return "progress";
            }
            return "open";
        }
        return this.selfFlow.getStatus();
    };
};