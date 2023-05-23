"use strict";


module.exports = class Inventory {
    /**
     *  Getting attributes from workflow.
     *  @param metaData for chosen type: server/applications
     *  @param workflow for getting attributes
     *  @return null if attributes isn't set.
     */
    constructor(metaData, workflow) {
        if (workflow && workflow.attributes) {
            this.attributes = workflow.attributes;
            this.metaData = metaData;
        }
    };


    /**
     *  Checking whether all mandatory fields are given.
     *  @return true if yes, else false.
     */
    isComplete() {
        if (!this.attributes) {
            return false;
        }
        const attrKeys = Object.keys(this.attributes);
        for (var i = 0; i < this.metaData.mandatory.length; i++) {
            var found = false;
            for (var j = 0; j < attrKeys.length; j++) {
                if (this.metaData.mandatory[i] === attrKeys[j]) {
                    if (attrKeys[j] != this.metaData.key 
                            && this.attributes[attrKeys[j]].trim().length === 0) {
                        return false;
                    }
                    found = true;
                    continue;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true && !this.hasError();
    };


    /**
     *  Checking if there are any errors.
     *  @return true if yes, else false.
     */
    hasError() {
        if (!this.attributes) {
            return false;
        }
        const attrKeys = Object.keys(this.attributes);
        for (var i = 0; i < attrKeys.length; i++) {
            if (this.attributes[attrKeys[i]] === this.metaData.error_entry) {
                return true;
            }
        }
        return false;
    };


    getKey() {
        if (!this.attributes) {
            return {};
        }
        const keys = Object.keys(this.attributes);

        for (var i = 0; i < keys.length; i++) {
            if (keys[i] === "name" || keys[i] === "servicename") {
                return this.attributes[keys[i]];
            }
        }
        return "";
    };


    getAttributes() {
        if (!this.attributes) {
            return {};
        }
        const keys = Object.keys(this.attributes);
        var tmp = {};

        for (var i = 0; i < keys.length; i++) {
            if (   keys[i] === "name"
                || keys[i] === "servicename"
                || keys[i] === "app_status") {
                continue;
            }
            tmp[keys[i]] = this.attributes[keys[i]];
        }
        return tmp;
    };
};