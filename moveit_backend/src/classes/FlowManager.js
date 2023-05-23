"use strict";
const _applyApplicationChanges  = require('./process/ApplyApplicationChanges');
const _applyServerChanges  	    = require('./process/ApplyServerChanges');


module.exports = class FlowManager {
    static applyApplicationChanges(user, server_id, app_name, applicationFlow, callback) {
        return _applyApplicationChanges(user, server_id, app_name, applicationFlow, callback);
    };


    static applyServerChanges(user, model, server_id, serverFlow, callback) {
        return _applyServerChanges(user, model, server_id, serverFlow, callback);
    };
};