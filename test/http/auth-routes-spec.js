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

describe('[authentication routes]', function() {
    var httpHelper;

    beforeEach(function() {
        httpHelper = new HttpHelper(_config.baseUrl, '/auth');
    });

    describe('[GET /login]', function() {
        var path = '/login';

        it('should return a login page', function(done) {
            httpHelper.testHtml(path, done);
        });
    });

    describe('[GET /logout]', function() {
        var path = '/logout';

        it('should return redirect the user to the home page when invoked without a redirect url', function(done) {
            httpHelper.test302(path, '/', done);
        });
    });
});
