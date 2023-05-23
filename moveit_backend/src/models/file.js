"use strict";
/**
 *  Modelling user self. Containing sessions.
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


/**
 * @swagger
 * definitions:
 *   File:
 *     properties:
 *       _id:
 *         type: string
 *         required: true
 *         description: Unique file ID
 *       name:
 *         type: string
 *         required: true
 *         description: Name of the file when uploaded
 *       status:
 *         type: string
 *         required: true
 *         description: open|progress|done
 *       createdAt:
 *         type: string
 *         description: Creation date of the file
 *       updatedAt:
 *         type: string
 *         description: Last updating date of the file
 *       owner:
 *         type: 'User Model'
 *         description: Last updating date of the file
 *       sheets:
 *         type: string
 *         description: Array of Sheets containing name and id
 *       draft:
 *         type: boolean
 *         description: True if user has a saved version.
 */
var FileSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },
    status: {
        type: String,
        required: true,
        lowercase: true
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'user'
    },
    draft: {
        type: Boolean
    },
    sheets: [{
        name: String,
        id: String
    }]
}, {timestamps: true});


module.exports = mongoose.model('file', FileSchema);