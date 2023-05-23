var mongoose         = require('mongoose');
var Schema           = mongoose.Schema;
var CommentSchema    = require('./comment');
var ServerFlow       = require('./flow/serverflow');


/**
 * @swagger
 * definitions:
 *   Component:
 *     properties:
 *       name:
 *         type: string
 *         required: true
 *         description: Name/Systemname/Hostname of an instance
 *       attributes:
 *         type: object
 *         required: true
 *         description: Random attributes with name and content
 *       comments:
 *         type: array
 *         items:
 *           type: object
 *       status:
 *         type: string
 *         description: Status of the instance
 *       type:
 *         type: string
 *         required: true
 *         description: Random attributes with name and content
 *       createdAt:
 *         type: string
 *         description: Creation date of the user
 *       updatedAt:
 *         type: string
 *         description: Last updating date of the user
 */
var ComponentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String
    },
    migrated: Boolean,
    planned: Boolean,
    inventory: Boolean,
    locked: Boolean,
    attributes: {},
    comments: [CommentSchema],
    workflow: ServerFlow
}, {timestamps: true, strict: false, minimize: false});


module.exports = mongoose.model('component', ComponentSchema);