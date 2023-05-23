const async             = require('async');


async.waterfall([
    function (next) {
        console.log("[InitScript]: Running serverReal.js");
        const serverReal = require('./serverReal');
        serverReal.serverReal(function() {
            next(null);
        });
    },
    // function (next) {
    //     console.log("[InitScript]: Running componentReal.js");
    //     const serverReal = require('./componentReal');
    //     serverReal.script(function() {
    //         next(null);
    //     });
    // },
    // function (next) {
    //     console.log("[InitScript]: Running markInventoryGifhorn.js");
    //     const script = require('./markInventoryGifhorn');
    //     script.script(function() {
    //         next(null);
    //     });
    // },
    // function (next) {
    //     console.log("[InitScript]: Running markInventoryStollberg.js");
    //     const script = require('./markInventoryStollberg');
    //     script.script(function() {
    //         next(null);
    //     });
    // }
], function(msg) {
    process.exit()
});