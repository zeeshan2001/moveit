const request         = require('supertest');
const should          = require('should');
const config          = require('../config');


module.exports = function(app) {
    describe('GET /application/summary/', function () {
        it('Getting application summary', function (done) {
            request(app)
                .get(config.url_base + '/application/summary/')
                .set('Cookie', 'jwt=' + config.jwt_token)
                .expect(200)
                .end(function(err, res) {
                    // console.log(">>>>", res.body);
                    done();
                });
        });
    });
};