/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _rewire = require('rewire');
var _promiseUtils = require('../../../server/utils/promise-utils');

describe('[server.utils.promiseUtils]', function() {

    beforeEach(function() {
        _promiseUtils = _rewire('../../../server/utils/promise-utils');
    });

    describe('[init]', function() {
        it('should expose the expected methods and properties', function() {
            expect(_promiseUtils).to.have.property('wrapWithExceptionHandler').and.to.be.a('function');
        });
    });

    describe('wrapWithExceptionHandler()', function() {

        function _getMockDeferred() {
            return {
                reject: _sinon.spy()
            };
        }

        it('should throw an error if invoked without a valid action function', function() {
            var error = 'Invalid action function specified (arg #1)';

            function invoke(action) {
                return function() {
                    _promiseUtils.wrapWithExceptionHandler(action);
                };
            }

            expect(invoke(null)).to.throw(error);
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('abc')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
        });

        it('should throw an error if invoked withour a valid deferred object', function() {
            var error = 'Invalid deferred object specified (arg #2)';

            function invoke(def) {
                return function() {
                    _promiseUtils.wrapWithExceptionHandler(function() {}, def);
                };
            }

            expect(invoke(null)).to.throw(error);
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('abc')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should return a function when invoked with a valid action function and deferred object', function() {
            var ret = _promiseUtils.wrapWithExceptionHandler(function() {}, _getMockDeferred());

            expect(ret).to.be.a('function');
        });

        it('should invoke the action function when the wrapper function is invoked', function() {
            var action = _sinon.spy();
            var ret = _promiseUtils.wrapWithExceptionHandler(action, _getMockDeferred());

            expect(action).to.not.have.been.called;
            ret();
            expect(action).to.have.been.calledOnce;
        });

        it('should reject the deferred object if the action function throws an error', function() {
            var error = new Error('Something went wrong!');
            var def = _getMockDeferred();
            var ret = _promiseUtils.wrapWithExceptionHandler(function() {
                throw error;
            }, def);

            expect(def.reject).to.not.have.been.called;
            ret();
            expect(def.reject).to.have.been.calledOnce;
            expect(def.reject).to.have.been.calledWith(error);
        });
    });
});
