"use strict";
const workflowMeta        = require('../../models/workflow');


module.exports = class Workflow {
    constructor(workflow, type) {
        this.workflow = this.filterByType(workflow, type);
    };


    getWorkflow() {
        return this.workflow;
    };


    filterByType(workflow, type) {
        var matches = [];
        for (var i = 0; i < workflowMeta.length; i++) {
            if (!workflowMeta[i].restrict || workflowMeta[i].restrict === type) {
                matches.push(workflowMeta[i]);
            }
        }
        return matches;
    };


    filterByCategory(category) {
        var matches = [];
        for (var i = 0; i < this.workflow.length; i++) {
            if (this.workflow[i].category === category) {
                matches.push(this.workflow[i]);
            }
        }
        return matches;
    };
};