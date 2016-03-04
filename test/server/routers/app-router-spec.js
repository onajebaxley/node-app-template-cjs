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
var _appRouter = null;

describe('[server.routers.appRouter]', function() {
    var _appHandlerProviderMock;
    var _sessionMock;
    var _passportMock;
    var _authMock;
    var _commonHandlerProviderMock;

    beforeEach(function() {
        _sessionMock = {
            getSessionHandler: _sinon.stub().returns(function() {})
        };
        _passportMock = {
            initialize: _sinon.stub().returns(function() {}),
            session: _sinon.stub().returns(function() {})
        };
        _authMock = {
            checkUserSession: _sinon.stub().returns(function() {})
        };

        _appHandlerProviderMock = _sinon.stub().returns({
            homePageHandler: _sinon.stub().returns(function() {})
        });

        _commonHandlerProviderMock = _sinon.stub().returns({
            injectUserResponseLocals: _sinon.stub().returns(function() {})
        });

        _appRouter = _rewire('../../../server/routers/app-router');
        _appRouter.__set__('_logger', _loggerHelper.initLogger(true));
        _appRouter.__set__('_session', _sessionMock);
        _appRouter.__set__('_passport', _passportMock);
        _appRouter.__set__('_auth', _authMock);
        _appRouter.__set__('AppHandlerProvider', _appHandlerProviderMock);
        _appRouter.__set__('CommonHandlerProvider', _commonHandlerProviderMock);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('[init]', function() {
        it('should expose the necessary fields and methods', function() {
            expect(_appRouter).to.have.property('createRouter').and.to.be.a('function');
        });
    });

    describe('createRouter()', function() {
        it('should return an object when invoked', function() {
            var router = _appRouter.createRouter();

            expect(router).to.be.a('function');
            expect(router.all).to.be.a('function');
            expect(router.param).to.be.a('function');
            expect(router.route).to.be.a('function');
            expect(router.use).to.be.a('function');
        });

        it('should correctly initialize the app handler provider object', function() {
            expect(_appHandlerProviderMock).to.not.have.been.called;

            _appRouter.createRouter();

            expect(_appHandlerProviderMock).to.have.been.calledOnce;
            expect(_appHandlerProviderMock).to.have.been.calledWithNew;
        });

        describe('[handler attachment]', function() {
            var mockExpress = null;

            beforeEach(function() {
                mockExpress = _expressMocks.getMockExpress();
                _appRouter.__set__('_express', mockExpress);
            });

            describe('[session middleware]', function() {
                it('should initialize a session handler', function() {
                    expect(_sessionMock.getSessionHandler).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(_sessionMock.getSessionHandler).to.have.been.calledOnce;
                });

                it('should bind the session handler as a middleware for all routes defined in the router', function() {
                    var sessionMiddleware = _sessionMock.getSessionHandler();

                    expect(mockExpress._router.use).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(mockExpress._router.use.callCount).to.be.at.least(1);
                    expect(mockExpress._router.use.args[0][0]).to.equal(sessionMiddleware);
                });
            });

            describe('[passport middleware - initialize]', function() {
                it('should initialize a session handler', function() {
                    expect(_passportMock.initialize).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(_passportMock.initialize).to.have.been.calledOnce;
                });

                it('should bind an authentication handler as a middleware for all routes defined in the router', function() {
                    var middleware = _passportMock.initialize();

                    expect(mockExpress._router.use).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(mockExpress._router.use.callCount).to.be.at.least(2);
                    expect(mockExpress._router.use.args[1][0]).to.equal(middleware);
                });
            });

            describe('[auth - check user session]', function() {
                it('should bind the check session handler as a middleware for all routes defined in the router', function() {
                    var middleware = _authMock.checkUserSession;

                    expect(mockExpress._router.use).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(mockExpress._router.use.callCount).to.be.at.least(3);
                    expect(mockExpress._router.use.args[2][0]).to.equal(middleware);
                });
            });

            describe('[passport middleware - session]', function() {
                it('should initialize the passport session', function() {
                    expect(_passportMock.session).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(_passportMock.session).to.have.been.calledOnce;
                });

                it('should bind the passport session handler as a middleware for all routes defined in the router', function() {
                    var middleware = _passportMock.session();

                    expect(mockExpress._router.use).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(mockExpress._router.use.callCount).to.be.at.least(4);
                    expect(mockExpress._router.use.args[3][0]).to.equal(middleware);
                });
            });

            describe('[user locals injection]', function() {
                it('should initialize a user local injection handler', function() {
                    var middleware = _commonHandlerProviderMock().injectUserResponseLocals;
                    expect(middleware).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(middleware).to.have.been.calledOnce;
                });

                it('should bind the user local injection handler as a middleware for all routes defined in the router', function() {
                    var middleware = _commonHandlerProviderMock().injectUserResponseLocals();

                    _appRouter.createRouter();

                    expect(mockExpress._router.use.callCount).to.be.at.least(5);
                    expect(mockExpress._router.use.args[4][0]).to.equal(middleware);
                });
            });

            describe('[routes]', function() {
                it('should attach the home page handler to the path GET /', function() {
                    var path = '/';
                    var provider = _appHandlerProviderMock();

                    expect(mockExpress._router.get).to.not.have.been.called;
                    expect(provider.homePageHandler).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(provider.homePageHandler).to.have.been.calledOnce;
                    var handler = provider.homePageHandler();
                    expect(mockExpress._router.get.callCount).to.be.at.least(1);
                    expect(mockExpress._router.get.args[0][0]).to.equal(path);
                    expect(mockExpress._router.get.args[0][1]).to.equal(handler);
                });
            });
        });
    });
});
