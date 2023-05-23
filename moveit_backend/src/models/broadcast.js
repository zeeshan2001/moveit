"use strict";
const UserModel = require('./user');


var BroadcastModel = new Schema({
    user: UserModel,
    type: {type: String},
    object: {
        name: String,
        action: String
    }
});