/* jshint expr:true */
'use strict';

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

describe('[app.core.config]', function() {
    'use strict';

    var provider = null;
    var $injector = null;

    beforeEach(angular.mock.module(_module, ['app.core.configProvider', function(injectedProvider) {
        provider = injectedProvider;
    }]));

    beforeEach(inject(['$injector', function(_$injector) {
        $injector = _$injector;
    }]));

    describe('[app.core.configProvider]', function() {
        describe('[init]', function() {
            it('should define the necessary fields and methods', function() {
                expect(provider).to.be.an('object');

                expect(provider).to.have.property('set').and.to.be.a('function');
            });
        });

        describe('set()', function() {
            it('should throw an error if invoked without a key', function() {
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
    });

    describe('[app.core.config]', function() {
        function _initService(settings) {
            settings = settings || {};

            for (var prop in settings) {
                provider.set(prop, settings[prop]);
            }
            return $injector.invoke(provider.$get);
        }

        describe('[init]', function() {
            it('should define the necessary fields and methods', function() {
                var service = _initService();

                expect(service).to.be.an('object');
                expect(service).to.have.property('get').and.to.be.a('function');
            });
        });

        describe('get()', function() {
            it('should return an undefined value if the configuration setting is undefined', function() {
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

            it('should return the property set using the provider if invoked with a valid key', function() {
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

            it('should return a deep copy of the property value, instead of a reference', function() {
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
