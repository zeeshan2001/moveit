"use strict";
var express             = require('express');
var app                 = express();
var cors                = require('cors')
var router              = express.Router();
var bodyParser          = require('body-parser');
var mongoose            = require('mongoose');
var cookieParser        = require('cookie-parser')
var config              = require('./config');
var logger              = require('../src/classes/Logger');
var status              = require('../src/utils/status');


mongoose.connect(config.database_address, {useNewUrlParser: true}, function(err) {
    if (!err) {
        logger.info("Connected to MongoDB using " + config.database_address);
    } else {
        logger.error("Can\'t connect to MongoDB using ' + config.database_address");
        return false;
    }
});


app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: true,
    limit: config.upload_limit
}));
app.use(bodyParser.json({
    limit: config.upload_limit
}));


app.use(cors({
    'origin': true,
    'credentials' : true
}));


app.use(function(req, res, next) {
    logger.info(req.method + " " + req.protocol + '://' + req.get('host') + req.originalUrl);
    
    require('../src/routes/session')(router);
    require('../src/routes/server')(router);
    require('../src/routes/file')(router);
    require('../src/routes/application')(router);
    require('../src/routes/workflow')(router);
    require('../src/routes/history')(router);
    require('../src/routes/user')(router);
    require('../src/routes/session')(router);
    require('../src/swagger')(router);
    require('../src/routes/extract')(router);
    require('../src/routes/default')(router);
    next();
});


app.use("/" + config.url, router);
const nodeServer = app.listen(config.port, function () {
    logger.info('Backend TEST using /' + config.url + ' and listening on port ' + config.port);
});


module.exports = app;