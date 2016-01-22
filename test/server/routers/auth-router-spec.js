/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;

var _rewire = require('rewire');
var _expressMocks = require('../../utils/express-mocks');
var _configHelper = require('../../utils/config-helper');
var _loggerHelper = require('../../utils/logger-helper');
var _authRouter = null;

describe('[server.routers.authRouter]', function() {
    var DEFAULT_REDIRECT_URL = '/';
    var _authHandlerProviderMock;

    beforeEach(function() {
        _authHandlerProviderMock = _sinon.stub().returns({
            loginPageHandler: _sinon.stub().returns(function() {}),
            logoutHandler: _sinon.stub().returns(function() {}),
            authUsernamePasswordHandler: _sinon.stub().returns(function() {})
        });

        _authRouter = _rewire('../../../server/routers/auth-router');
        _authRouter.__set__('_logger', _loggerHelper.initLogger(true));
        _authRouter.__set__('AuthHandlerProvider', _authHandlerProviderMock);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('[init]', function() {
        it('should expose the necessary fields and methods', function() {
            expect(_authRouter).to.have.property('createRouter').and.to.be.a('function');
        });
    });

    describe('createRouter()', function() {
        it('should return an object when invoked', function() {
            var router = _authRouter.createRouter();

            expect(router).to.be.a('function');
            expect(router.all).to.be.a('function');
            expect(router.param).to.be.a('function');
            expect(router.route).to.be.a('function');
            expect(router.use).to.be.a('function');
        });

        it('should correctly initialize the auth handler provider object', function() {
            expect(_authHandlerProviderMock).to.not.have.been.called;

            _authRouter.createRouter();

            expect(_authHandlerProviderMock).to.have.been.calledOnce;
            expect(_authHandlerProviderMock).to.have.been.calledWithNew;
            expect(_authHandlerProviderMock).to.have.
                        been.calledWith(DEFAULT_REDIRECT_URL);
        });

        describe('[handler attachment]', function() {
            var mockExpress = null;

            beforeEach(function() {
                mockExpress = _expressMocks.getMockExpress();
                _authRouter.__set__('_express', mockExpress);
            });

            it('should attach the login page handler to the path GET /login', function() {
                var path = '/login';
                var provider = _authHandlerProviderMock();

                expect(mockExpress._router.get).to.not.have.been.called;
                expect(provider.loginPageHandler).to.not.have.been.called;

                _authRouter.createRouter();

                expect(provider.loginPageHandler).to.have.been.calledOnce;
                var handler = provider.loginPageHandler();
                expect(mockExpress._router.get.callCount).to.be.at.least(1);
                expect(mockExpress._router.get.args[0][0]).to.equal(path);
                expect(mockExpress._router.get.args[0][1]).to.equal(handler);
            });

            it('should attach the logout handler to the path GET /logout', function() {
                var path = '/logout';
                var provider = _authHandlerProviderMock();

                expect(mockExpress._router.get).to.not.have.been.called;
                expect(provider.logoutHandler).to.not.have.been.called;

                _authRouter.createRouter();

                expect(provider.logoutHandler).to.have.been.calledOnce;
                var handler = provider.logoutHandler();
                expect(mockExpress._router.get.callCount).to.be.at.least(2);
                expect(mockExpress._router.get.args[1][0]).to.equal(path);
                expect(mockExpress._router.get.args[1][1]).to.equal(handler);
            });

            it('should attach the username-password authentication handler to the path POST /login', function() {
                var path = '/login';
                var provider = _authHandlerProviderMock();

                expect(mockExpress._router.post).to.not.have.been.called;
                expect(provider.authUsernamePasswordHandler).to.not.have.been.called;

                _authRouter.createRouter();

                expect(provider.authUsernamePasswordHandler).to.have.been.calledOnce;
                var handler = provider.authUsernamePasswordHandler();
                expect(mockExpress._router.post.callCount).to.be.at.least(1);
                expect(mockExpress._router.post.args[0][0]).to.equal(path);
                expect(mockExpress._router.post.args[0][1]).to.equal(handler);
            });
        });
    });
});
