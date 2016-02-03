/* jshint node:true, expr:true */
'use strict';

var _path = require('path');
var _assertionHelper = require('wysknd-test').assertionHelper;

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;

var HttpHelper = require('../utils/http-helper');
var _packageJson = require('../../package.json');
var _config = require('../config');

describe('[application routes]', function() {
    var DEFAULT_USERNAME = 'pparker';
    var DEFAULT_PASSWORD = 'pparker';
    var httpHelper;

    beforeEach(function() {
        httpHelper = new HttpHelper(_config.baseUrl, '/');
    });

    describe('[GET /app]', function() {
        var path = '/app';

        it('should redirect the user to the login page when no authentication token is present', function(done) {
            httpHelper.test302(path, '/auth/login?redirect=' + path, done);
        });

        it('should render an HTML page when a valid authentication token is present', function(done) {
            httpHelper.getAuthToken('/auth/login', DEFAULT_USERNAME, DEFAULT_PASSWORD)
                .then(function(token) {
                    httpHelper.testGet(path, done, {
                        headers: {
                            'cookie': token
                        }
                    }, {});
                }, _assertionHelper.getNotifyFailureHandler(done));
        });
    });
});
