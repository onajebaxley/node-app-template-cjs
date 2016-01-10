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

xdescribe('RoutesHandler', function() {

    beforeEach(function() {
        _testUtils.initLogger();
    });

    afterEach(function() {
        _testUtils.resetLogger();
    });

    describe('ctor()', function() {
        it('should get an instance of the global logger when invoked', function() {
            GLOBAL.getLogger.reset();
            var handler = new RoutesHandler();

            expect(GLOBAL.getLogger).to.have.been.calledOnce;
        });
    });

    describe('_wrapHandler()', function() {
        it('should throw an error if invoked with an invalid handler', function() {
            var error = 'Invalid callback specified (arg #1)';

            function invokeMethod(innerHandler) {
                return function() {
                    var handler = new RoutesHandler();
                    return handler._wrapHandler(innerHandler);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(1)).to.throw(error);
            expect(invokeMethod('string')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
        });

        it('should return a function when invoked with a valid handler', function() {
            var innerHandler = _sinon.spy();
            var handler = new RoutesHandler();

            var wrappedHandler = handler._wrapHandler(innerHandler);

            expect(wrappedHandler).to.be.a('function');
        });

        it('should invoke the inner handler when the wrapped handler is invoked', function() {
            var innerHandler = _sinon.spy();
            var handler = new RoutesHandler();
            var wrappedHandler = handler._wrapHandler(innerHandler);

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            wrappedHandler(req, res, next);

            expect(innerHandler).to.have.been.calledWith(req, res, next);
        });

        it('should log the error and respond with an HTTP 500 if the inner handler throws an error', function() {
            var error = new Error('something went wrong!');
            var innerHandler = function() {
                throw error;
            };
            var handler = new RoutesHandler();
            var wrappedHandler = handler._wrapHandler(innerHandler);

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            wrappedHandler(req, res, next);

            expect(_testUtils._logger.error).to.have.been.calledWith(error.toString());
            expect(res.status).to.have.been.calledWith(500);
            expect(res.send).to.have.been.calledWith(error.toString());
        });
    });
});
