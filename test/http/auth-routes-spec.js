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

    describe('[POST /login]', function() {
        var path = '/login';

        it('should return an html page if an invalid username/password is provided', function(done) {
            httpHelper.testPost(path, done, {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: {
                    username: 'bad user',
                    password: 'bad password'
                }
            }, {});
        });

        it('should set an authenticated session cookie if authentication is successful', function(done) {
            var cookieName = _packageJson.name.replace(/-/g, '_') + '_session';
            var cookiePattern = new RegExp(cookieName);
            httpHelper.testPost(path, done, {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: {
                    username: 'pparker',
                    password: 'pparker'
                }
            }, {
                code: 302,
                headers: {
                    'set-cookie': cookiePattern
                }
            });
        });

        it('should redirect the user to the application root on successful authentication if no redirect url is specified', function(done) {
            httpHelper.testPost(path, done, {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: {
                    username: 'pparker',
                    password: 'pparker'
                }
            }, {
                code: 302,
                headers: {
                    'content-type': /text\/plain/,
                    location: '/'
                }
            });
        });

        it('should redirect the user to the specified redirect url on successful authentication', function(done) {
            var redirectUrl = '/foo/bar';

            httpHelper.testPost(path, done, {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: {
                    username: 'pparker',
                    password: 'pparker',
                    redirect: redirectUrl
                }
            }, {
                code: 302,
                headers: {
                    'content-type': /text\/plain/,
                    location: redirectUrl
                }
            });
        });

    });

    describe('[GET /logout]', function() {
        var path = '/logout';

        it('should redirect the user to the home page when invoked without a redirect url', function(done) {
            httpHelper.test302(path, '/', done);
        });

        it('should redirect the user to the specified page when invoked with a redirect url', function(done) {
            var redirectUrl = '/foo';
            path = path + '?redirect=' + redirectUrl
            httpHelper.test302(path, redirectUrl, done);
        });
    });
});
