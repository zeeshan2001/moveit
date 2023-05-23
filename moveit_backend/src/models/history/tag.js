"use strict";
/**
 * @swagger
 * definitions:
 *   Logger Actions:
 *     properties:
 *       DELETED:
 *         type: string
 *         description: deleted
 *       INVENTORY:
 *         type: string
 *         description: inventory
 *       PLANNED:
 *         type: string
 *         description: planned
 *       MIGRATED:
 *         type: string
 *         description: migrated
 *       EDITED:
 *         type: string
 *         description: edited
 *       ERROR:
 *         type: string
 *         description: error
 */
const HistoryTag = {
    DELETED: 'deleted',
    INVENTORY: 'inventory',
    PLANNED: 'planned',
    MIGRATED: 'migrated',
    EDITED: 'edited',
    ERROR: 'error'
};


module.exports = HistoryTag;