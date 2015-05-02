/* jshint node:true, expr:true */
'use strict';
var _config = require('../../config');
var _supertest = require('supertest');
var expect = require('chai').expect;

describe('/', function() {
    var request = _supertest(_config.baseUrl);

    it('should show the application status when invoked', function(done) {
        request.get('/__status')
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
