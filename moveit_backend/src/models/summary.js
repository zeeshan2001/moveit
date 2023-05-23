"use strict";

/**
 * @swagger
 * definitions:
 *   Summary:
 *     properties:
 *       open:
 *         type: number
 *         required: true
 *         description: Count of items having status open
 *       progress:
 *         type: number
 *         required: true
 *         description: Count of items having status progress
 *       done:
 *         type: number
 *         description: Count of items having status done
 */
var SummarySchema = new Schema({
	open: Number,
	progress: Number,
	done: Number
});