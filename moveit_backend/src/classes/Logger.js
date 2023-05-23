/**
 *  This module is configuring winston.
 *  Adding timestamp and separating files.
 *  Just include this module to use the logger as defined below.
 */
var winston = require('winston');
var config = require('../config');


// Available levels for winston logger:
// const levels = { 
//   error: 0, 
//   warn: 1, 
//   info: 2, 
//   verbose: 3, 
//   debug: 4, 
//   silly: 5 
// };


/**
 *  Setting min log level to verbose and adding timestamp to logs.
 *  Separating errors from other levels as second log file.
 *  Custom output. No JSON, just single lines.
 */
const { splat, combine, timestamp, printf } = winston.format;
const myFormat = printf(({ timestamp, level, message, meta }) => {
    return `${timestamp}; ${level}; ${message}; ${meta? JSON.stringify(meta) : ''}`;
});
const logger = winston.createLogger({
    level: 'verbose',
    format: combine(
        timestamp(),
        splat(),
        myFormat
    ),
    transports: [
        new winston.transports.File({
            level: 'error',
            filename: './' + config.log_dir + '/error.log'
        }),
        new winston.transports.File({
            level: 'info',
            filename: './' + config.log_dir + '/logger.log'
        })
    ]
});


/**
 *  If environment is set to dev we want to print logs to console.
 *  That's what's done here.
 */
if (process.env.NODE_ENV === 'dev') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}


module.exports = logger;