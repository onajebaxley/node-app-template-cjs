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
var _clone = require('clone');

var _module = 'app.core';
var _mockHelper = require('../../../client-utils/mock-helper');

describe('[app.core.stateBag]', function() {
    'use strict';

    var localStorageMock = null;
    var provider = null;
    var $injector = null;

    beforeEach(function() {
        localStorageMock = _mockHelper.createLocalStorageMock();
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('localStorageService', localStorageMock);
    }]));

    beforeEach(angular.mock.module(['app.core.stateBagProvider', function(injectedProvider) {
        provider = injectedProvider;
    }]));

    beforeEach(inject(['$injector', function(_$injector) {
        $injector = _$injector;
    }]));

    function _initService(stateBag) {
        stateBag = stateBag || {};

        for (var key in stateBag) {
            localStorageMock.set('_state.' + key, _clone(stateBag[key]));
        }
        return $injector.invoke(provider.$get);
    }

    describe('[app.core.stateBag]', function() {
        describe('[init]', function() {
            it('should define the necessary fields and methods', function() {
                var service = _initService();

                expect(service).to.be.an('object');
                expect(service).to.have.property('set').and.to.be.a('function');
                expect(service).to.have.property('get').and.to.be.a('function');
            });

            it('should load values from local storage on load if local storage is supported', function() {
                var props = {
                    foo: 'bar',
                    abc: 123,
                    isFalse: true
                };

                localStorageMock.isSupported = true;
                var service = _initService(props);
                for (var key in props) {
                    expect(service.get(key)).to.equal(props[key]);
                }
            });

            it('should not load values from local storage on load if local storage is not supported', function() {
                var props = {
                    foo: 'bar',
                    abc: 123,
                    isFalse: true
                };

                localStorageMock.isSupported = false;
                var service = _initService(props);
                for (var key in props) {
                    expect(service.get(key)).to.be.undefined;
                }
            });
        });

        describe('set()', function() {
            it('should throw an error if invoked without a key', function() {
                var error = 'Invalid key specified (arg #1)';
                var service = _initService();

                function invokeMethod(key) {
                    return function() {
                        return service.set(key, 'foo');
                    };
                }

                expect(invokeMethod()).to.throw(error);
                expect(invokeMethod(null)).to.throw(error);
                expect(invokeMethod(123)).to.throw(error);
                expect(invokeMethod('')).to.throw(error);
                expect(invokeMethod(true)).to.throw(error);
                expect(invokeMethod({})).to.throw(error);
                expect(invokeMethod([])).to.throw(error);
                expect(invokeMethod(function() {})).to.throw(error);
            });

            it('store the value against the key if invoked with a valid key', function() {
                var service = _initService();
                var props = {
                    foo: 'bar',
                    abc: 123,
                    isFalse: true
                };

                var key = null;
                for (key in props) {
                    service.set(key, props[key]);
                }

                for (key in props) {
                    expect(service.get(key)).to.equal(props[key]);
                }
            });

            it('store the value in local storage if the persist flag is set to true and local storage is supported', function() {
                var props = {
                    foo: 'bar',
                    abc: 123,
                    isFalse: true
                };
                localStorageMock.isSupported = true;

                var service = _initService();
                var spy = _sinon.stub(localStorageMock, 'set');
                for (var key in props) {
                    var stateKey = '_state.' + key;
                    expect(localStorageMock.set).to.not.have.been.called;
                    service.set(key, props[key], true);
                    expect(localStorageMock.set).to.have.been.calledOnce;
                    expect(localStorageMock.set).to.have.been.calledWith(stateKey, props[key]);
                    localStorageMock.set.reset();
                }
            });

            it('store not the value in local storage if the persist flag is set to true but local storage is not supported', function() {
                var props = {
                    foo: 'bar',
                    abc: 123,
                    isFalse: true
                };
                localStorageMock.isSupported = false;

                var service = _initService();
                var spy = _sinon.stub(localStorageMock, 'set');
                for (var key in props) {
                    var stateKey = '_state.' + key;
                    expect(localStorageMock.set).to.not.have.been.called;
                    service.set(key, props[key], true);
                    expect(localStorageMock.set).to.not.have.been.called;
                    localStorageMock.set.reset();
                }
            });

            it('store not the value in local storage if the persist flag is set to false even if local storage is supported', function() {
                var props = {
                    foo: 'bar',
                    abc: 123,
                    isFalse: true
                };
                localStorageMock.isSupported = true;

                var service = _initService();
                var spy = _sinon.stub(localStorageMock, 'set');
                for (var key in props) {
                    var stateKey = '_state.' + key;
                    expect(localStorageMock.set).to.not.have.been.called;
                    service.set(key, props[key], false);
                    expect(localStorageMock.set).to.not.have.been.called;
                    localStorageMock.set.reset();
                }
            });
        });

        describe('get()', function() {
            it('should return an undefined value if the state value is undefined', function() {
                var service = _initService();

                expect(service.get()).to.be.undefined;
                expect(service.get(null)).to.be.undefined;
                expect(service.get(123)).to.be.undefined;
                expect(service.get('bad-key')).to.be.undefined;
                expect(service.get(true)).to.be.undefined;
                expect(service.get([])).to.be.undefined;
                expect(service.get({})).to.be.undefined;
                expect(service.get(function() {})).to.be.undefined;
            });

            it('should return the default value if the setting is undefined, and a default value is specified', function() {
                var service = _initService();

                function doTest(key, defaultValue) {
                    expect(service.get(key, defaultValue)).to.equal(defaultValue);
                }

                doTest('bad-key', null);
                doTest('bad-key', undefined);
                doTest('bad-key', 1234);
                doTest('bad-key', 'foobar');
                doTest('bad-key', true);
                doTest('bad-key', []);
                doTest('bad-key', {});
                doTest('bad-key', function() {});
            });

            it('should return the property previously set if invoked with a valid key', function() {
                var props = {
                    foo: 'bar',
                    abc: 123,
                    isFalse: true
                };
                localStorageMock.isSupported = false;

                var service = _initService(props);
                var prop = null;
                for (prop in props) {
                    service.set(prop, props[prop]);
                }

                for (prop in props) {
                    expect(service.get(prop)).to.deep.equal(props[prop]);
                }
            });

            it('should return a deep copy of the property value, instead of a reference', function() {
                var props = {
                    complex: {
                        a: 'b',
                        c: 'd',
                        n: {
                            some: 'property'
                        }
                    }
                };
                localStorageMock.isSupported = false;

                var service = _initService(props);
                var prop = null;
                for (prop in props) {
                    service.set(prop, props[prop]);
                }

                for (prop in props) {
                    expect(service.get(prop)).to.not.equal(props[prop]);
                }
            });

        });
    });
});
