"use strict";
/**
 *  Starting script here.
 *  In this file the routing part is done.
 *  And also some settings and database connection.
 */
var express             = require('express');
var app                 = express();
var cors                = require('cors')
var router              = express.Router();
var bodyParser          = require('body-parser');
var mongoose            = require('mongoose');
var cookieParser        = require('cookie-parser')
var config              = require('./src/config');
var JWTProxy            = require('./src/classes/JWTProxy');
var logger              = require('./src/classes/Logger');
var status              = require('./src/utils/status');
var socket              = require('socket.io');
var io                  = null;
var fs 			        = require('fs');
var https 		        = require('https');

var privateKey  = fs.readFileSync('./src/moveit.bieneit.de/privkey.pem', 'utf8');
var certificate = fs.readFileSync('./src/moveit.bieneit.de/fullchain.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var CronJob = require("cron").CronJob;
var dbBackup = require("./cronJobs").dbBackup;


/* Checking for existing JWT keys */
if (!JWTProxy.secret_exists()) {
    logger.error("Missing keys in \'./secrets/\'. Shutting down!");
    return false;
}


/* Connecting to database MongoDB using its driver mongoose. */
mongoose.connect(config.database_address, {useNewUrlParser: true}, function(err) {
    if (!err) {
        logger.info("Connected to MongoDB using " + config.database_address);
    } else {
        logger.error("Can\'t connect to MongoDB using ' + config.database_address");
        return false;
    }
});


/* Telling we want to use JSON and Cookies. */
app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: true,
    limit: config.upload_limit
}));
app.use(bodyParser.json({
    limit: config.upload_limit
}));


/* Allowing cross platform requests (different domains/ports). */
app.use(cors({
    'origin': true,
    'credentials' : true
}));
// app.use((req, res, next) => {
//     res.append('Access-Control-Allow-Origin' , 'http://localhost:4200');
//     res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.append("Access-Control-Allow-Headers", "Origin, Accept,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
//     res.append('Access-Control-Allow-Credentials', true);
//     next();
// });

/* Routing: Including all parts we want to use. */
app.use(function(req, res, next) {
    logger.info(req.method + " " + req.protocol + '://' + req.get('host') + req.originalUrl);

    require('./src/routes/session')(router);
    require('./src/routes/server')(router);
    require('./src/routes/file')(router);
    require('./src/routes/application')(router);
    require('./src/routes/workflow')(router);
    require('./src/routes/history')(router);
    require('./src/routes/user')(router);
    require('./src/routes/session')(router);
    require('./src/routes/component')(router);
    require('./src/swagger')(router);
    require('./src/routes/schedule')(router);
    require('./src/routes/extract')(router);
    require('./src/routes/default')(router);
    next();
});


var httpsServer = https.createServer(credentials, app);
/* App listening on URL using given port and including routes. */
app.use("/" + config.url, router);
const nodeServer = app.listen(config.port, function () {
    logger.info('Backend using /' + config.url + ' and listening on port ' + config.port);
});


io = socket.listen(nodeServer);
io.sockets.on('connection', function(socket) {
    logger.verbose("User connected to socket");
    
    // socket.on('join', (data) => {
    //     logger.verbose("Socket #join received: " + data);
    //     // io.sockets.emit('broadcast', {test: "yeah, working"});
    //     socket.broadcast.in(data.room).emit('join', {test: true});
    // });

    socket.on('disconnect', function() {
        logger.verbose("User disconnected from socket");
    });
});

var job = new CronJob("0 8 * * *", function () {
    dbBackup();
    console.log("Commands executed!");
}, null, true, 'America/Los_Angeles');
job.start();

module.exports = app;
