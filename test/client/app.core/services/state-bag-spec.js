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

    function _applySettings(settings) {
        settings = settings || {};

        for (var prop in settings) {
            provider.set(prop, settings[prop]);
        }
    }

    function _initService(settings) {
        _applySettings(settings);
        return $injector.invoke(provider.$get);
    }

    describe('[app.core.stateBag]', function() {
        function _initLocalStorage(props) {
            props = props || {};

            for(var key in props) {
                localStorageMock.set(key, props[key]);
            }
        }

        describe('[init]', function() {
            it('should define the necessary fields and methods', function() {
                var service = _initService();

                expect(service).to.be.an('object');
                expect(service).to.have.property('set').and.to.be.a('function');
                expect(service).to.have.property('get').and.to.be.a('function');
            });

            it('should load values from local storage on load', function() {
                var props = {
                    foo: 'bar',
                    abc: 123,
                    isFalse: true
                };

                _initLocalStorage(props);
                var service = _initService();
                for(var key in props) {
                    expect(service.get(key)).to.equal(props[key]);
                }
            });
        });

        describe('set()', function() {
            xit('should throw an error if invoked without a key', function() {
                var error = 'Invalid key specified (arg #1)';

                function invokeMethod(key) {
                    return function() {
                        return provider.set(key, 'foo');
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
        });

        describe('get()', function() {
            xit('should return an undefined value if the configuration setting is undefined', function() {
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

            xit('should return the default value if the setting is undefined, and a default value is specified', function() {
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

            xit('should return the property set using the provider if invoked with a valid key', function() {
                var settings = {
                    environment: 'production',
                    endpoints: {
                        api: {
                            url: '/foo',
                            security: null
                        },
                        thirdParty: {
                            url: 'http://thirdparty/api',
                            security: 'HEADER'
                        }
                    },
                    counter: 20,
                    isTest: false
                };
                var service = _initService(settings);

                for (var prop in settings) {
                    expect(service.get(prop)).to.deep.equal(settings[prop]);
                }
            });

            xit('should return a deep copy of the property value, instead of a reference', function() {
                var settings = {
                    options: ['foo', 'bar', 'baz'],
                    endpoints: {
                        api: {
                            url: '/foo',
                            security: null
                        },
                        thirdParty: {
                            url: 'http://thirdparty/api',
                            security: 'HEADER'
                        }
                    }
                };
                var service = _initService(settings);

                for (var prop in settings) {
                    expect(service.get(prop)).to.not.equal(settings[prop]);
                }
            });

        });
    });
});
