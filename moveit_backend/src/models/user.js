"use strict";
/**
 *  Modelling user self. Containing sessions.
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


/**
 * @swagger
 * definitions:
 *   User:
 *     properties:
 *       _id:
 *         type: string
 *         required: true
 *         description: Unique user ID
 *       email:
 *         type: string
 *         required: true
 *         description: Unique user E-Mail address
 *       password:
 *         type: string
 *         required: true
 *         description: User password
 *       firstname:
 *         type: string
 *         description: Firstname of user
 *       lastname:
 *         type: string
 *         description: Lastname of user
 *       ldap_uid:
 *         type: string
 *         description: Unique ID from LDAP.
 *         required: true
 *       session:
 *         type: string
 *         description: JWT Token of user
 *       createdAt:
 *         type: string
 *         description: Creation date of the user
 *       updatedAt:
 *         type: string
 *         description: Last updating date of the user
 */
var UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		index: true,
		trim: true,
		lowercase: true
	},
	firstname: {
		type: String,
	},
	lastname: {
		type: String
	},
	ldap_uid: {
		type: String,
		//required: true
	},
	session: {
		type: String
	},
	password:{
		type:String
	}
}, {timestamps: true});


module.exports = mongoose.model('user', UserSchema);