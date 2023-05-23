"use strict";
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


/**
 * @swagger
 * definitions:
 *   History:
 *     properties:
 *       _id:
 *         type: string
 *         required: true
 *         description: Unique ID of history
 *       username:
 *         type: string
 *         required: true
 *         description: Owner of history
 *       user_id:
 *         type: string
 *         required: true
 *         description: Owner ID of history
 *       instance_name:
 *         type: string
 *         required: true
 *         description: Name of server/app/component
 *       type:
 *         type: string
 *         description: Type e.g. app, server, component
 *       item:
 *         type: object
 *         description: Object... old state
 *       action_tag:
 *         type: string
 *         description: E.g. DELETED/UPDATED
 *       reference:
 *         type: string
 *         description: Reference of item/ID of server/app/component...
 *       createdAt:
 *         type: string
 *         description: Creation date of the history
 *       updatedAt:
 *         type: string
 *         description: Last updating date of the history
 */
var HistorySchema = new Schema({
    username: String,
    user_id: String,
    instance_name: String,
    type: {
        type: String
    },
    action_tag: String,
    reference: {
        type: Schema.ObjectId
    },
    item: {}
}, {
    timestamps: true
});


module.exports = mongoose.model('history', HistorySchema);