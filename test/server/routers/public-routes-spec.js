/* jshint node:true, expr:true */
'use strict';
var _path = require('path');
var _config = require('../../config');
var _supertest = require('supertest');
var _wyskndTest = require('wysknd-test');

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var assertionHelper = _wyskndTest.assertionHelper;

xdescribe('[public routes]', function() {
    var MOUNT_PATH = '/';
    var request = _supertest(_config.baseUrl);

    function _getPath(path) {
        return _path.join(MOUNT_PATH, path);
    }

    describe('GET /__status', function() {
        it('should show the application status when invoked', function(done) {
            request.get(_getPath('/__status'))
                .set('Accept', 'application/json')
                .expect(200)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    var payload = res.body;
                    expect(payload).to.be.defined;
                    expect(payload.app).to.equal('node-app-template-cjs');
                    expect(payload.version).to.be.a('string');
                    expect(payload.timestamp).to.be.a('number');
                    done();
                });
        });
    });
});
