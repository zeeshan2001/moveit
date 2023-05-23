"use strict";


module.exports = class Migration {
	constructor(workflowMeta, workflowItem) {
        this.workflowMeta = workflowMeta;
        this.workflowItem = workflowItem;
    };


    isComplete() {
        for (var i = 0; i < this.workflowMeta.length; i++) {
            const item = this.workflowItem[this.workflowMeta[i].code];
            if (item.checked === undefined || item.checked === null) {
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


    getInstanceNewName(old_name) {
        if (!this.workflowItem["was_test_migration_successfull"]) {
            return "";
        }
        const content = this.workflowItem["was_test_migration_successfull"].content;
        if (!content || !content instanceof Array) {
            return;
        }
        for (var i = 0; i < content.length; i++) {
            if (content[i].old_name == old_name) {
                return content[i].new_name;
            }
        }
        return "";
    };
};