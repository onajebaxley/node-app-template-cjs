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

describe('[error routes]', function() {
    var MOUNT_PATH = '/';
    var request = _supertest(_config.baseUrl);

    function _getPath(path) {
        return _path.join(MOUNT_PATH, path);
    }

    describe('[authentication failed error]', function() {
        var path = null;

        beforeEach(function() {
            path = _getPath('/app/');
        });

        it('should return an HTTP 302 code with correct response headers when invoked', function(done) {
            request.get(path)
                .expect(302)
                .expect('content-type', /text\/html/)
                .end(function(err, res) {
                    expect(err).to.be.null;
                    done();
                });
        });
    });

    describe('[resource not found error]', function() {
        var path = null;

        beforeEach(function() {
            path = _getPath('/missing/resource');
        });

        it('should return an HTTP 404 code with correct response headers when invoked', function(done) {
            request.get(path)
                .expect(404)
                .expect('content-type', /text\/html/)
                .end(function(err, res) {
                    expect(err).to.be.null;
                    done();
                });
        });
    });

});
