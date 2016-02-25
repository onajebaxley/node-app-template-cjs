/* jshint expr:true */

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _angular = require('angular');
var _ngMocks = require('angular-mocks');

var _module = 'app.core';

describe('[app.core.utils]', function() {
    'use strict';

    var service = null;

    beforeEach(angular.mock.module(_module));
    beforeEach(inject(['app.core.utils', function(injectedService) {
        service = injectedService;
    }]));

    describe('[app.core.utils]', function() {
        describe('[init]', function() {
            it('should define the necessary fields and methods', function() {
                expect(service).to.be.an('object');
                expect(service.applyDefault).and.to.be.a('function');
                expect(service.applyDefaultIfNotString).and.to.be.a('function');
                expect(service.applyDefaultIfNotNumber).and.to.be.a('function');
                expect(service.applyDefaultIfNotObject).and.to.be.a('function');
                expect(service.applyDefaultIfNotArray).and.to.be.a('function');
            });
        });

        describe('applyDefault()', function() {
            it('should return the input value if it is truthy', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefault(value, defaultValue)).to.equal(value);
                }

                doTest(1234, undefined);
                doTest('foobar', undefined);
                doTest(true, undefined);
                doTest([], undefined);
                doTest({}, undefined);
                doTest(function() {}, undefined);
            });

            it('should return the default value if the input value is falsy', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefault(value, defaultValue)).to.equal(defaultValue);
                }

                doTest(undefined, null);
                doTest(undefined, undefined);
                doTest(undefined, 1234);
                doTest(undefined, 'foobar');
                doTest(undefined, true);
                doTest(undefined, []);
                doTest(undefined, {});
                doTest(undefined, function() {});
            });
        });

        describe('applyDefaultIfNotString()', function() {
            it('should return the default value if the value is not a string, or is empty and canBeFalsy==false', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotString(value, defaultValue, false)).to.equal(defaultValue);
                }

                var defaultValue = 'default';
                doTest(1234, defaultValue);
                doTest('', defaultValue);
                doTest(true, defaultValue);
                doTest([], defaultValue);
                doTest({}, defaultValue);
                doTest(function() {}, defaultValue);
            });

            it('should return the default value if the value is not a string and canBeFalsy==true', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotString(value, defaultValue, true)).to.equal(defaultValue);
                }

                var defaultValue = 'default';
                doTest(1234, defaultValue);
                doTest(true, defaultValue);
                doTest([], defaultValue);
                doTest({}, defaultValue);
                doTest(function() {}, defaultValue);
            });

            it('should return the input value if the value is a non empty string, and canBeFalsy==false', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotString(value, defaultValue, false)).to.equal(value);
                }

                doTest('foo', undefined);
                doTest('bar', undefined);
            });

            it('should return the input value if the value is a string, and canBeFalsy==true', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotString(value, defaultValue, true)).to.equal(value);
                }

                doTest('foo', undefined);
                doTest('bar', undefined);
                doTest('', undefined);
            });
        });

        describe('applyDefaultIfNotNumber()', function() {
            it('should return the default value if the value is not a number, or is empty and canBeFalsy==false', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotNumber(value, defaultValue, false)).to.equal(defaultValue);
                }

                var defaultValue = 'default';
                doTest(0, defaultValue);
                doTest('abc', defaultValue);
                doTest(true, defaultValue);
                doTest([], defaultValue);
                doTest({}, defaultValue);
                doTest(function() {}, defaultValue);
            });

            it('should return the default value if the value is not a number and canBeFalsy==true', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotNumber(value, defaultValue, true)).to.equal(defaultValue);
                }

                var defaultValue = 'default';
                doTest('abc', defaultValue);
                doTest(true, defaultValue);
                doTest([], defaultValue);
                doTest({}, defaultValue);
                doTest(function() {}, defaultValue);
            });

            it('should return the input value if the value is a number, and canBeFalsy==false', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotNumber(value, defaultValue, false)).to.equal(value);
                }

                doTest(123, undefined);
                doTest(456, undefined);
            });

            it('should return the input value if the value is a number, and canBeFalsy==true', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotNumber(value, defaultValue, true)).to.equal(value);
                }

                doTest(123, undefined);
                doTest(456, undefined);
                doTest(0, undefined);
            });
        });

        describe('applyDefaultIfNotObject()', function() {
            it('should return the default value if the value is not an object', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotObject(value, defaultValue)).to.equal(defaultValue);
                }

                var defaultValue = 'default';
                doTest(1234, defaultValue);
                doTest('abc', defaultValue);
                doTest(true, defaultValue);
                doTest([], defaultValue);
                doTest(function() {}, defaultValue);
            });

            it('should return the input value if the value is an object', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotObject(value, defaultValue)).to.equal(value);
                }

                doTest({}, undefined);
                doTest({
                    foo: 'bar'
                }, undefined);
            });
        });

        describe('applyDefaultIfNotArray()', function() {
            it('should return the default value if the value is not an array', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotArray(value, defaultValue)).to.equal(defaultValue);
                }

                var defaultValue = 'default';
                doTest(1234, defaultValue);
                doTest('abc', defaultValue);
                doTest(true, defaultValue);
                doTest({}, defaultValue);
                doTest(function() {}, defaultValue);
            });

            it('should return the input value if the value is an array', function() {
                function doTest(value, defaultValue) {
                    expect(service.applyDefaultIfNotArray(value, defaultValue)).to.equal(value);
                }

                doTest([], undefined);
                doTest([1, 2, 3], undefined);
            });
        });
    });
});
