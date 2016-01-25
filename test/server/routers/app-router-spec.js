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
var _appRouter = null;

describe('[server.routers.appRouter]', function() {
    var _appHandlerProviderMock;
    var _sessionMock;
    var _passportMock;

    beforeEach(function() {
        _sessionMock = {
            getSessionHandler: _sinon.stub().returns(function() {})
        };
        _passportMock = {
            initialize: _sinon.stub().returns(function() {})
        };

        _appHandlerProviderMock = _sinon.stub().returns({
            homePageHandler: _sinon.stub().returns(function() {})
        });

        _appRouter = _rewire('../../../server/routers/app-router');
        _appRouter.__set__('_logger', _loggerHelper.initLogger(true));
        _appRouter.__set__('_session', _sessionMock);
        _appRouter.__set__('_passport', _passportMock);
        _appRouter.__set__('AppHandlerProvider', _appHandlerProviderMock);
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

            describe('[passport middleware]', function() {
                it('should initialize a session handler', function() {
                    expect(_passportMock.initialize).to.not.have.been.called;

                    _appRouter.createRouter();

                    expect(_passportMock.initialize).to.have.been.calledOnce;
                });

                it('should bind an authentication handler as a middleware for all routes defined in the router', function() {
                    var passportMiddleware = _passportMock.initialize();

                    expect(mockExpress._router.use).to.not.have.been.called;

                    _appRouter.createRouter();
                    
                    expect(mockExpress._router.use.callCount).to.be.at.least(2);
                    expect(mockExpress._router.use.args[1][0]).to.equal(passportMiddleware);
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