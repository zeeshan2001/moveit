"use strict";


module.exports = class Planning {
    constructor(workflowMeta, workflowItem) {
        this.workflowMeta = workflowMeta;
        this.workflowItem = workflowItem;
    };


    isComplete() {
        for (var i = 0; i < this.workflowMeta.length; i++) {
            const item = this.workflowItem[this.workflowMeta[i].code];
            if (!item || item.checked === undefined || item.checked === null) {
                return false;
            }
        }
        return true && !this.hasError();
    };


    hasError() {
        if (!this.workflowItem) {
            return false;
        }
        for (var i = 0; i < this.workflowMeta.length; i++) {
            const item = this.workflowItem[this.workflowMeta[i].code];
            if (item && item.checked === false) {
                return true;
            }
        }
        return false;
    };
};