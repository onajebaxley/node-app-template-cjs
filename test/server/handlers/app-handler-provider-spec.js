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
var AppHandlerProvider = null;

describe('AppHandlerProvider', function() {
    beforeEach(function() {
        AppHandlerProvider = _rewire('../../../server/handlers/app-handler-provider');
        AppHandlerProvider.__set__('_logger', _loggerHelper.initLogger(true));
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('ctor()', function() {
        it('should expose the methods required by the interface', function() {
            var provider = new AppHandlerProvider();

            expect(provider).to.be.an('object');
            expect(provider).to.have.property('homePageHandler').and.to.be.a('function');
        });
    });

    describe('homePageHandler()', function() {
        it('should return a function when invoked', function() {
            var provider = new AppHandlerProvider();
            var handler = provider.homePageHandler();

            expect(handler).to.be.a('function');
        });

        it('should render the home page when invoked', function() {
            var provider = new AppHandlerProvider();
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
});
