/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _expressMocks = require('../../utils/express-mocks');
var _testUtils = require('../../utils/test-utils');
var RoutesHandler = require('../../../server/routes/routes-handler');
var PublicRoutesHandler = require('../../../server/routes/public-routes-handler');

describe('PublicRoutesHandler', function() {
    var APP_NAME = 'mock-app';
    var APP_VERSION = '1.0.0-mock';
    var originalConfig = null;

    beforeEach(function() {
        _testUtils.initLogger();
        originalConfig = GLOBAL.config;
        GLOBAL.config = {
            cfg_app_name: APP_NAME,
            cfg_app_version: APP_VERSION,
        };
    });

    afterEach(function() {
        _testUtils.resetLogger();
        GLOBAL.config = originalConfig;
        originalConfig = null;
    });

    describe('ctor()', function() {
        it('should expose the methods required by the interface', function() {
            var handler = new PublicRoutesHandler();

            expect(handler).to.be.an.instanceof(RoutesHandler);
            expect(handler).to.have.property('getHomePageHandler').and.to.be.a('function');
            expect(handler).to.have.property('getHelpPageHandler').and.to.be.a('function');
            expect(handler).to.have.property('getAppStatusHandler').and.to.be.a('function');
        });
    });

    describe('getHomePageHandler()', function() {
        it('should return a function when invoked', function() {
            var handler = new PublicRoutesHandler();
            var pageHandler = handler.getHomePageHandler();

            expect(pageHandler).to.be.a('function');
        });

        it('should render the home page when invoked', function() {
            var handler = new PublicRoutesHandler();
            var pageHandler = handler.getHomePageHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            pageHandler(req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render.args[0][0]).to.equal('index');
            expect(res.render.args[0][1]).to.deep.equal({});
        });
    });

    describe('getHelpPageHandler()', function() {
        it('should return a function when invoked', function() {
            var handler = new PublicRoutesHandler();
            var pageHandler = handler.getHelpPageHandler();

            expect(pageHandler).to.be.a('function');
        });

        it('should render the help page when invoked', function() {
            var handler = new PublicRoutesHandler();
            var pageHandler = handler.getHelpPageHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            pageHandler(req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render.args[0][0]).to.equal('help');
            expect(res.render.args[0][1]).to.deep.equal({});
        });
    });

    describe('getAppStatusHandler()', function() {
        it('should return a function when invoked', function() {
            var handler = new PublicRoutesHandler();
            var pageHandler = handler.getAppStatusHandler();

            expect(pageHandler).to.be.a('function');
        });

        it('should respond with the app status when invoked', function() {
            var handler = new PublicRoutesHandler();
            var pageHandler = handler.getAppStatusHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            var startTime = Date.now();
            pageHandler(req, res, next);

            expect(res.status).to.have.been.calledWith(200);
            expect(res.send).to.have.been.calledOnce;
            var payload = res.send.args[0][0];
            expect(payload.app).to.equal(APP_NAME);
            expect(payload.version).to.equal(APP_VERSION);
            expect(payload.timestamp).to.be.within(startTime, Date.now());
        });
    });
});
