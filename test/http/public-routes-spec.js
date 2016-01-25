/* jshint node:true, expr:true */
'use strict';

var _packageJson = require('../../package.json');
var _path = require('path');
var _config = require('../config');
var _supertest = require('supertest');
var _wyskndTest = require('wysknd-test');

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _assertionHelper = _wyskndTest.assertionHelper;

describe('[public routes]', function() {
    var MOUNT_PATH = '/';
    var request = _supertest(_config.baseUrl);

    function _getPath(path) {
        return _path.join(MOUNT_PATH, path);
    }

    describe('[GET /]', function() {
        var path = null;

        beforeEach(function() {
            path = _getPath('/');
        });

        it('should return an HTTP 200 code with correct response headers when invoked', function(done) {
            request.get(path)
                .expect(200)
                .expect('content-type', /text\/html/)
                .end(function(err, res) {
                    expect(err).to.be.null;
                    done();
                });
        });
    });

    describe('[GET /__status]', function() {
        var path = null;

        beforeEach(function() {
            path = _getPath('/__status');
        });

        it('should return an HTTP 200 code with correct response headers when invoked', function(done) {
            request.get(path)
                .expect(200)
                .expect('content-type', /application\/json/)
                .end(function(err, res) {
                    expect(err).to.be.null;
                    done();
                });
        });

        it('should respond with the correct application status payload when invoked', function(done) {
            var startTime = Date.now();
            request.get(path)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    var payload = res.body;
                    var versionPattern = new RegExp(_packageJson.version);

                    expect(payload).to.be.defined;
                    expect(payload.app).to.equal(_packageJson.name);
                    expect(payload.version).to.match(versionPattern);
                    expect(payload.timestamp).to.be.a('number');
                    expect(payload.timestamp).to.be.within(startTime, Date.now());
                    done();
                });
        });
    });
});
