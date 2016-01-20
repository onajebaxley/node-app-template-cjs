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
var PublicHandlerProvider = null;

describe('PublicHandlerProvider', function() {
    var APP_NAME = 'mock-app';
    var APP_VERSION = '1.0.0-mock';

    beforeEach(function() {
        _loggerHelper.initLogger();
        PublicHandlerProvider = _rewire('../../../server/handlers/public-handler-provider');
        PublicHandlerProvider.__set__('_logger', _loggerHelper.initLogger(true));

        _configHelper.setConfig('cfg_app_name', APP_NAME);
        _configHelper.setConfig('cfg_app_version', APP_VERSION);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('ctor()', function() {
        it('should throw an error if invoked with an invalid app name', function() {
            var error = 'Invalid app name specified (arg #1)';
            function invoke(appName) {
                return function() {
                    return new PublicHandlerProvider(appName);
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

        it('should throw an error if invoked with an invalid app version', function() {
            var error = 'Invalid app version specified (arg #2)';
            function invoke(appVersion) {
                return function() {
                    return new PublicHandlerProvider(APP_NAME, appVersion);
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
            var provider = new PublicHandlerProvider(APP_NAME, APP_VERSION);

            expect(provider).to.be.an('object');
            expect(provider).to.have.property('homePageHandler').and.to.be.a('function');
            expect(provider).to.have.property('helpPageHandler').and.to.be.a('function');
            expect(provider).to.have.property('appStatusHandler').and.to.be.a('function');
        });
    });

    describe('homePageHandler()', function() {
        it('should return a function when invoked', function() {
            var provider = new PublicHandlerProvider(APP_NAME, APP_VERSION);
            var handler = provider.homePageHandler();

            expect(handler).to.be.a('function');
        });

        it('should render the home page when invoked', function() {
            var provider = new PublicHandlerProvider(APP_NAME, APP_VERSION);
            var handler = provider.homePageHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render.args[0][0]).to.equal('home');
            expect(res.render.args[0][1]).to.deep.equal({});
        });
    });

    describe('helpPageHandler()', function() {
        it('should return a function when invoked', function() {
            var provider = new PublicHandlerProvider(APP_NAME, APP_VERSION);
            var handler = provider.helpPageHandler();

            expect(handler).to.be.a('function');
        });

        it('should render the home page when invoked', function() {
            var provider = new PublicHandlerProvider(APP_NAME, APP_VERSION);
            var handler = provider.helpPageHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render.args[0][0]).to.equal('help');
            expect(res.render.args[0][1]).to.deep.equal({});
        });
    });

    describe('appStatusHandler()', function() {
        it('should return a function when invoked', function() {
            var provider = new PublicHandlerProvider(APP_NAME, APP_VERSION);
            var handler = provider.appStatusHandler();

            expect(handler).to.be.a('function');
        });

        it('should respond with the app status when invoked', function() {
            var provider = new PublicHandlerProvider(APP_NAME, APP_VERSION);
            var handler = provider.appStatusHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            var startTime = Date.now();
            handler(req, res, next);

            expect(res.set).to.have.been.calledOnce;
            expect(res.set.args[0][0]).to.deep.equal({
                'content-type': 'application/json'
            });

            expect(res.status).to.have.been.calledOnce;
            expect(res.status).to.have.been.calledWith(200);

            expect(res.send).to.have.been.calledOnce;
            var payload = res.send.args[0][0];
            expect(payload.app).to.equal(APP_NAME);
            expect(payload.version).to.equal(APP_VERSION);
            expect(payload.timestamp).to.be.within(startTime, Date.now());
        });
    });
});
