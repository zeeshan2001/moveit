"use strict";
/**
 * @swagger
 * definitions:
 *   Status HTTP:
 *     properties:
 *       OK:
 *         type: integer
 *         description: 200
 *       CREATED:
 *         type: integer
 *         description: 201
 *       ACCEPTED:
 *         type: integer
 *         description: 202
 *       UNAUTHORIZED:
 *         type: integer
 *         description: 401
 *       FORBIDDEN:
 *         type: integer
 *         description: 403
 *       NOT_FOUND:
 *         type: integer
 *         description: 404
 *       NOT_ACCEPTABLE:
 *         type: integer
 *         description: 406
 *       ERROR:
 *         type: integer
 *         description: 500
 */
const status = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    NOT_ACCEPTABLE: 406,
    ERROR: 500
};


module.exports = status;