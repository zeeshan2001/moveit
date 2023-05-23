"use strict";
const config              = require('../config');
const Workflow            = require('../classes/workflow/Workflow');
const Planning            = require('../classes/workflow/Planning');
const Migration           = require('../classes/workflow/Migration');
const Inventory           = require('../classes/workflow/Inventory');


module.exports = class ItemFlow {
    constructor(appWorkflow, type) {
        this.meta = config.app_settings.meta.application;
        if (type === "server") {
            this.meta = config.app_settings.meta.server;
        }
        this.Workflow = new Workflow(appWorkflow, type);
        
        this.Inventory = new Inventory(this.meta, appWorkflow);
        this.Planning = new Planning(
            this.Workflow.filterByCategory("planning"),
            appWorkflow
        );
        this.Migration = new Migration(
            this.Workflow.filterByCategory("migration"),
            appWorkflow
        );
    };


    isInventored() {
        return this.Inventory.isComplete();
    };


    isPlanned() {
        if (!this.isInventored()) {
            return false;
        }
        return this.Planning.isComplete();
    };


    isMigrated() {
        if (!this.isPlanned()) {
            return false;
        }
        return this.Migration.isComplete();
    };


    getInstanceNewMigrationName(oldname) {
        return this.Migration.getInstanceNewName(oldname);
    };


    hasError() {
        if (this.Inventory.hasError() === true
            || this.Planning.hasError()  === true
            || this.Migration.hasError()  === true) {
            return true;
        }
        return false;
    };


    getKey() {
        return this.Inventory.getKey();
    };


    getAttributes() {
        return this.Inventory.getAttributes();
    };


    getStatus() {
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
    };
};