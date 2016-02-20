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
var User = require('../../../server/lib/user');

var CommonHandlerProvider = null;

describe('CommonHandlerProvider', function() {

    beforeEach(function() {
        CommonHandlerProvider = _rewire('../../../server/handlers/common-handler-provider');
        CommonHandlerProvider.__set__('_logger', _loggerHelper.initLogger(true));
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('ctor()', function() {
        it('should expose the methods required by the interface', function() {
            var provider = new CommonHandlerProvider();

            expect(provider).to.be.an('object');
            expect(provider).to.have.property('injectUserResponseLocals').and.to.be.a('function');
        });
    });

    describe('injectUserResponseLocals()', function() {
        it('should return a function when invoked', function() {
            var provider = new CommonHandlerProvider();
            var handler = provider.injectUserResponseLocals();

            expect(handler).to.be.a('function');
        });

        it('should call next() when invoked', function() {
            var provider = new CommonHandlerProvider();
            var handler = provider.injectUserResponseLocals();

            var req = _expressMocks.getMockReq();
            req.session = { username: 'jdoe' };
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);
            expect(next).to.have.been.calledOnce;
        });

        it('should not set the username or user variables if the request session is not defined', function() {
            var provider = new CommonHandlerProvider();
            var handler = provider.injectUserResponseLocals();
            var username = 'jdoe';

            var req = _expressMocks.getMockReq();
            req.session = undefined;
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);
            expect(res.locals.rv_username).to.be.undefined;
            expect(res.locals.rv_user).to.be.undefined;
        });

        it('should set a username variable if the request session is defined', function() {
            var provider = new CommonHandlerProvider();
            var handler = provider.injectUserResponseLocals();
            var username = 'jdoe';

            var req = _expressMocks.getMockReq();
            req.session = { username: username };
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);
            expect(res.locals.rv_username).to.equal(username);
        });

        it('should set a user variable if the request session is defined', function() {
            var provider = new CommonHandlerProvider();
            var handler = provider.injectUserResponseLocals();
            var user = new User('jdoe');

            var req = _expressMocks.getMockReq();
            req.session = { user: user };
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);
            expect(res.locals.rv_user).to.equal(user);
        });
    });
});
