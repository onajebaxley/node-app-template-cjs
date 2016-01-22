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
var _publicRouter = null;

describe('[server.routers.publicRouter]', function() {
    var DEFAULT_APP_NAME = 'mock-app';
    var DEFAULT_APP_VERSION = '1.0.0-mock';

    var _publicHandlerProviderMock;

    beforeEach(function() {
        _publicHandlerProviderMock = _sinon.stub().returns({
            portalPageHandler: _sinon.stub().returns(function() {}),
            helpPageHandler: _sinon.stub().returns(function() {}),
            appStatusHandler: _sinon.stub().returns(function() {})
        });

        _publicRouter = _rewire('../../../server/routers/public-router');
        _publicRouter.__set__('_logger', _loggerHelper.initLogger(true));
        _publicRouter.__set__('PublicHandlerProvider', _publicHandlerProviderMock);

        _configHelper.setConfig('cfg_app_name', DEFAULT_APP_NAME);
        _configHelper.setConfig('cfg_app_version', DEFAULT_APP_VERSION);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('[init]', function() {
        it('should expose the necessary fields and methods', function() {
            expect(_publicRouter).to.have.property('createRouter').and.to.be.a('function');
        });
    });

    describe('createRouter()', function() {
        it('should return an object when invoked', function() {
            var router = _publicRouter.createRouter();

            expect(router).to.be.a('function');
            expect(router.all).to.be.a('function');
            expect(router.param).to.be.a('function');
            expect(router.route).to.be.a('function');
            expect(router.use).to.be.a('function');
        });

        it('should correctly initialize the public handler provider object', function() {
            expect(_publicHandlerProviderMock).to.not.have.been.called;

            _publicRouter.createRouter();

            expect(_publicHandlerProviderMock).to.have.been.calledOnce;
            expect(_publicHandlerProviderMock).to.have.been.calledWithNew;
            expect(_publicHandlerProviderMock).to.have.
                        been.calledWith(DEFAULT_APP_NAME, DEFAULT_APP_VERSION);
        });

        describe('[handler attachment]', function() {
            var mockExpress = null;

            beforeEach(function() {
                mockExpress = _expressMocks.getMockExpress();
                _publicRouter.__set__('_express', mockExpress);
            });

            it('should attach the home page handler to the path GET /', function() {
                var path = '/';
                var provider = _publicHandlerProviderMock();

                expect(mockExpress._router.get).to.not.have.been.called;
                expect(provider.portalPageHandler).to.not.have.been.called;

                _publicRouter.createRouter();

                expect(provider.portalPageHandler).to.have.been.calledOnce;
                var handler = provider.portalPageHandler();
                expect(mockExpress._router.get.callCount).to.be.at.least(1);
                expect(mockExpress._router.get.args[0][0]).to.equal(path);
                expect(mockExpress._router.get.args[0][1]).to.equal(handler);
            });

            it('should attach the help page handler to the path GET /help', function() {
                var path = '/help';
                var provider = _publicHandlerProviderMock();

                expect(mockExpress._router.get).to.not.have.been.called;
                expect(provider.helpPageHandler).to.not.have.been.called;

                _publicRouter.createRouter();

                expect(provider.helpPageHandler).to.have.been.calledOnce;
                var handler = provider.helpPageHandler();
                expect(mockExpress._router.get.callCount).to.be.at.least(2);
                expect(mockExpress._router.get.args[1][0]).to.equal(path);
                expect(mockExpress._router.get.args[1][1]).to.equal(handler);
            });

            it('should attach the status page handler to the path GET /__status', function() {
                var path = '/__status';
                var provider = _publicHandlerProviderMock();

                expect(mockExpress._router.get).to.not.have.been.called;
                expect(provider.appStatusHandler).to.not.have.been.called;

                _publicRouter.createRouter();

                expect(provider.appStatusHandler).to.have.been.calledOnce;
                var handler = provider.appStatusHandler();
                expect(mockExpress._router.get.callCount).to.be.at.least(3);
                expect(mockExpress._router.get.args[2][0]).to.equal(path);
                expect(mockExpress._router.get.args[2][1]).to.equal(handler);
            });
        });
    });
});
