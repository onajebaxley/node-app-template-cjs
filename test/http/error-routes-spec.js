/* jshint node:true, expr:true */
'use strict';

var _path = require('path');

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;

var HttpHelper = require('../server-utils/http-helper');
var _packageJson = require('../../package.json');
var _config = require('../config');

describe('[error routes]', function() {
    var httpHelper;

    beforeEach(function() {
        httpHelper = new HttpHelper(_config.baseUrl, '/');
    });

    describe('[authentication failed error]', function() {
        var path = '/app';

        it('should redirect the user to the login page with the correct post login redirect url', function(done) {
            httpHelper.test302(path, '/auth/login?redirect=' + path, done);
        });
    });

    describe('[resource not found error]', function() {
        var path = '/missing/resource';

        it('should return an HTTP 404 along with an HTML payload', function(done) {
            httpHelper.test404(path, done);
        });
    });

});
