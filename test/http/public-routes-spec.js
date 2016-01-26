/* jshint node:true, expr:true */
'use strict';

var _path = require('path');

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;

var HttpHelper = require('../utils/http-helper');
var _packageJson = require('../../package.json');
var _config = require('../config');

describe('[public routes]', function() {
    var httpHelper;

    beforeEach(function() {
        httpHelper = new HttpHelper(_config.baseUrl, '/');
    });

    describe('[GET /css/app.css]', function() {
        var path = '/css/app.css';

        it('should return a css file', function(done) {
            httpHelper.testCss(path, done);
        });
    });

    describe('[GET /js/app.js]', function() {
        var path = '/js/app.js';

        it('should return a javascript file', function(done) {
            httpHelper.testJs(path, done);
        });
    });

    describe('[GET /]', function() {
        var path = '/';

        it('should return the portal page', function(done) {
            httpHelper.testHtml(path, done);
        });
    });

    describe('[GET /__status]', function() {
        var path = '/__status';

        it('should return a json payload', function(done) {
            httpHelper.testJson(path, done);
        });

        it('should include application status properties with the JSON payload', function(done) {
            var startTime = Date.now();
            httpHelper.testJson(path, done, function(err, res) {
                var payload = res.body;
                var versionPattern = new RegExp(_packageJson.version);

                expect(payload).to.be.defined;
                expect(payload.app).to.equal(_packageJson.name);
                expect(payload.version).to.match(versionPattern);
                expect(payload.timestamp).to.be.a('number');
                expect(payload.timestamp).to.be.within(startTime, Date.now());
            });
        });
    });
});
