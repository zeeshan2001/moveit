"use strict";
var status 				= require('../utils/status');


/**
 *	Catching default and invalid URLs here.
 */
module.exports = function(app) {
	/**
	 *	Handling default URL. Method doesn't matter.
	 */
	app.all('/', function(req, res, next) {
		return res.status(status.OK).send({
			"status": "active",
			"message": "API is running"
		});
	});


	/**
	 *	If a resource can't be found, no matter which method,
	 *	this call will be executed.
	 */
	app.all('*', function(req, res, next) {
		return res.status(status.NOT_FOUND).send({
			"message": "Ressource not found"
		});
	});
};