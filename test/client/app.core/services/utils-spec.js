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
    });
});
