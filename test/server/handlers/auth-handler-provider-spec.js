/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;

var _rewire = require('rewire');
var _expressMocks = require('../../server-utils/express-mocks');
var _configHelper = require('../../server-utils/config-helper');
var _loggerHelper = require('../../server-utils/logger-helper');
var User = require('../../../server/lib/user');
var AuthHandlerProvider = null;

describe('AuthHandlerProvider', function() {
    var DEFAULT_REDIRECT_URL = '/';
    var _passportMock = null;

    beforeEach(function() {
        _passportMock = {
            authenticate: _sinon.stub().returns(_sinon.spy())
        };

        AuthHandlerProvider = _rewire('../../../server/handlers/auth-handler-provider');
        AuthHandlerProvider.__set__('_logger', _loggerHelper.initLogger(true));
        AuthHandlerProvider.__set__('_passport', _passportMock);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('ctor()', function() {
        it('should throw an error if invoked with a default redirect path', function() {
            var error = 'Invalid redirect url specified (arg #1)';

            function invoke(defaultRedirect) {
                return function() {
                    return new AuthHandlerProvider(defaultRedirect);
                };
            }

            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should expose the methods required by the interface', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);

            expect(provider).to.be.an('object');
            expect(provider).to.have.property('loginPageHandler').and.to.be.a('function');
            expect(provider).to.have.property('logoutHandler').and.to.be.a('function');
            expect(provider).to.have.property('authHandler').and.to.be.a('function');
        });
    });

    describe('loginPageHandler()', function() {
        it('should return a function when invoked', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.loginPageHandler();

            expect(handler).to.be.a('function');
        });

        it('should render the login page when invoked', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.loginPageHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render.args[0][0]).to.equal('login');
        });

        it('should pass on the redirect uri specified via a query string parameter', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.loginPageHandler();

            var resourceUri = '/foo/bar';
            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            req.query.redirect = resourceUri;

            handler(req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render.args[0][1]).to.deep.equal({
                redirect: resourceUri
            });
        });

        it('should pass on the default resource uri if no redirect query string parameter is specifed', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.loginPageHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render.args[0][1]).to.deep.equal({
                redirect: DEFAULT_REDIRECT_URL
            });
        });
    });

    describe('logoutHandler()', function() {
        function _getMockReq() {
            var req = _expressMocks.getMockReq();
            req.user = {
                username: 'jdoe'
            };
            req.logOut = _sinon.spy();

            return req;
        }

        it('should return a function when invoked', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.logoutHandler();

            expect(handler).to.be.a('function');
        });

        it('should do nothing if a user is not already logged in', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.logoutHandler();

            var req = _getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            req.user = undefined;

            expect(req.logOut).to.not.have.been.called;
            handler(req, res, next);

            expect(req.logOut).to.not.have.been.called;
        });

        it('should log the user out when invoked', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.logoutHandler();

            var req = _getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            expect(req.logOut).to.not.have.been.called;
            handler(req, res, next);

            expect(req.logOut).to.have.been.calledOnce;
        });

        it('should clear the username in the session when invoked, if the request session is defined', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.logoutHandler();

            var req = _getMockReq();
            req.session = {
                username: req.user.username
            };
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);

            expect(req.session.username).to.be.undefined;
        });

        it('should not attempt to clear the username from the session if the request session is defined', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.logoutHandler();

            var req = _getMockReq();
            req.session = undefined;
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);
            expect(req.session).to.be.undefined;
        });

        it('should redirect the user to the resource uri specified via a query string parameter', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.logoutHandler();

            var resourceUri = '/foo/bar';
            var req = _getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            req.query.redirect = resourceUri;

            handler(req, res, next);

            expect(res.redirect).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledWith(resourceUri);
        });

        it('should redirect the user to the default resource uri if no redirect query string parameter is specified', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.logoutHandler();

            var req = _getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);

            expect(res.redirect).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledWith(DEFAULT_REDIRECT_URL);
        });
    });

    describe('authHandler()', function() {
        var DEFAULT_STRATEGY_NAME = 'username-password';

        function _getMockReq() {
            var req = _expressMocks.getMockReq();
            req.user = {
                username: 'jdoe'
            };
            req.logIn = _sinon.spy();

            return req;
        }

        it('should throw an error if invoked without a valid strategy', function() {
            var error = 'Invalid strategy specified (arg #1)';

            function invoke(strategy) {
                return function() {
                    var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
                    var handler = provider.authHandler(strategy);
                };
            }

            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should return a function when invoked', function() {
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.authHandler(DEFAULT_STRATEGY_NAME);

            expect(handler).to.be.a('function');
        });

        it('should invoke passport to generate a handler using the username/password strategy', function() {
            var strategyName = 'some-strategy';
            var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
            var handler = provider.authHandler(strategyName);

            var req = _getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            expect(_passportMock.authenticate).to.not.have.been.called;

            handler(req, res, next);

            expect(_passportMock.authenticate).to.have.been.calledOnce;
            expect(_passportMock.authenticate.args[0][0]).to.equal(strategyName);
            expect(_passportMock.authenticate.args[0][1]).to.be.a('function');

            handler = _passportMock.authenticate();
            expect(handler).to.have.been.calledOnce;
            expect(handler).to.have.been.calledWith(req, res, next);
        });

        describe('[authentication callback]', function() {
            it('should invoke next() with an error if the passport strategy reports an error authenticating the user', function() {
                var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
                var handler = provider.authHandler(DEFAULT_STRATEGY_NAME);

                var req = _getMockReq();
                var res = _expressMocks.getMockRes();
                var next = _sinon.spy();
                var error = new Error('authentication error');

                handler(req, res, next);

                var authCallback = _passportMock.authenticate.args[0][1];

                expect(next).to.not.have.been.called;
                authCallback(error, null, null);

                expect(next).to.have.been.calledOnce;
                expect(next).to.have.been.calledWith(error);
            });

            it('should redirect the user to the login page if the passport strategy reports failed authentication', function() {
                var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
                var handler = provider.authHandler(DEFAULT_STRATEGY_NAME);

                var req = _getMockReq();
                var res = _expressMocks.getMockRes();
                var next = _sinon.spy();
                var username = 'jdoe';
                var errorMessage = 'Invalid username and/or password';
                var redirect = '/app';

                req.body.username = username;
                req.body.redirect = redirect;
                handler(req, res, next);

                var authCallback = _passportMock.authenticate.args[0][1];

                expect(res.render).to.not.have.been.called;
                authCallback(null, null, null);

                expect(next).to.not.have.been.called;
                expect(res.render).to.have.been.calledOnce;
                expect(res.render.args[0][0]).to.equal('login');
                expect(res.render.args[0][1]).to.deep.equal({
                    username: username,
                    errorMessage: errorMessage,
                    redirect: redirect
                });
            });

            it('should log the user if the passport strategy reports successful authentication', function() {
                var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
                var handler = provider.authHandler(DEFAULT_STRATEGY_NAME);

                var req = _getMockReq();
                var res = _expressMocks.getMockRes();
                var next = _sinon.spy();
                var user = new User('jdoe');

                handler(req, res, next);

                var authCallback = _passportMock.authenticate.args[0][1];

                expect(req.logIn).to.not.have.been.called;
                authCallback(null, user, null);

                expect(next).to.not.have.been.called;
                expect(res.render).to.not.have.been.called;
                expect(req.logIn).to.have.been.calledOnce;
                expect(req.logIn.args[0][0]).to.equal(user);
                expect(req.logIn.args[0][1]).to.be.a('function');
            });

            describe('[session establishment callback]', function() {
                var req = null;
                var res = null;
                var next = null;
                var sessionCallback = null;
                var username = null;

                beforeEach(function() {
                    username = 'jdoe';
                    var provider = new AuthHandlerProvider(DEFAULT_REDIRECT_URL);
                    var handler = provider.authHandler(DEFAULT_STRATEGY_NAME);
                    var user = new User(username);

                    req = _getMockReq();
                    req.session = {};
                    res = _expressMocks.getMockRes();
                    next = _sinon.spy();
                    handler(req, res, next);

                    var authCallback = _passportMock.authenticate.args[0][1];
                    authCallback(null, user, null);
                    sessionCallback = req.logIn.args[0][1];
                });

                it('should invoke next() with an error if session establishment reports an error', function() {
                    var error = new Error('session establishment error');

                    expect(next).to.not.have.been.called;
                    sessionCallback(error);

                    expect(next).to.have.been.calledOnce;
                    expect(next).to.have.been.calledWith(error);
                });

                it('should redirect the user to the redirect uri if session establishment is successful', function() {
                    var resourceUri = '/foo/bar';

                    req.body.redirect = resourceUri;

                    expect(res.redirect).to.not.have.been.called;
                    sessionCallback(null);

                    expect(next).to.not.have.been.called;
                    expect(res.redirect).to.have.been.calledOnce;
                    expect(res.redirect).to.have.been.calledWith(resourceUri);
                });

                it('should redirect the user to the default resource uri if the request body does not specify a value', function() {
                    expect(res.redirect).to.not.have.been.called;
                    sessionCallback(null);

                    expect(next).to.not.have.been.called;
                    expect(res.redirect).to.have.been.calledOnce;
                    expect(res.redirect).to.have.been.calledWith(DEFAULT_REDIRECT_URL);
                });

                it('should save the username in the session if a request session is defined', function() {
                    expect(req.session).to.be.empty;
                    sessionCallback(null);

                    expect(req.session.username).to.equal(username);
                });

                it('should not save the username in the session if a request session is not defined', function() {
                    req.session = undefined;
                    sessionCallback(null);

                    expect(req.session).to.be.undefined;
                });
            });
        });
    });
});
