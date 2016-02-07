/* jshint expr:true */
/* global alert:true */

var _angular = require('angular');
var _ngMocks = require('angular-mocks');
var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');
var _module = 'app.core';

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

describe('[app.core.user]', function() {
    'use strict';

    var provider = null;
    var $injector = null;

    beforeEach(angular.mock.module(_module, ['app.core.userProvider', function(injectedProvider) {
        provider = injectedProvider;
    }]));

    beforeEach(inject(['$injector', function(_$injector) {
        $injector = _$injector;
    }]));

    describe('[app.core.userProvider]', function() {
        describe('[init]', function() {
            it('should define the necessary fields and methods', function() {
                expect(provider).to.be.an('object');

                expect(provider).to.have.property('initialize').and.to.be.a('function');
            });
        });

        describe('initialize()', function() {
            it('should throw an error if invoked without a valid roles array', function() {
                var error = 'Invalid user roles specified (arg #1)';

                function invokeMethod(roles) {
                    return function() {
                        return provider.initialize(roles);
                    };
                }

                expect(invokeMethod()).to.throw(error);
                expect(invokeMethod(null)).to.throw(error);
                expect(invokeMethod('abc')).to.throw(error);
                expect(invokeMethod(123)).to.throw(error);
                expect(invokeMethod(true)).to.throw(error);
                expect(invokeMethod({
                    foo: 'bar'
                })).to.throw(error);
                expect(invokeMethod(function() {})).to.throw(error);
            });

            it('should throw an error if any of the user roles are non-string values', function() {
                function doTest(param) {
                    var invoke = function() {
                        return provider.initialize([param]);
                    };
                    var error = 'User role must be a string: ' + JSON.stringify(param);
                    expect(invoke).to.throw(error);
                }

                doTest();
                doTest(null);
                doTest(123);
                doTest(true);
                doTest({
                    foo: 'bar'
                });
                doTest([]);
                doTest(function() {});
            });

            it('should not throw any errors if a properties map is not passed', function() {
                function invokeMethod(properties) {
                    return function() {
                        return provider.initialize(['admin'], properties);
                    };
                }

                expect(invokeMethod()).to.not.throw();
                expect(invokeMethod(null)).to.not.throw();
            });
        });
    });

    describe('[app.core.user]', function() {
        function _initService(roles, properties) {
            roles = roles || ['user'];
            properties = properties || {};

            provider.initialize(roles, properties);
            return $injector.invoke(provider.$get);
        }

        describe('[init]', function() {
            it('should throw an error if the service has not been initialized first', function() {
                var error = 'Cannot inject user. The user object has not been initialized';
                var invoke = function() {
                    var service = $injector.invoke(provider.$get);
                };

                expect(invoke).to.throw(error);
            });

            it('should define the necessary fields and methods', function() {
                var service = _initService();
                expect(service).to.be.an('object');
                expect(service).to.have.property('hasRole').and.to.be.a('function');
                expect(service).to.have.property('getServiceToken').and.to.be.a('function');
            });

            it('should include all properties that were passed during initialization', function() {
                var propertyMap = {
                    firstName: 'john',
                    lastName: 'doe',
                    email: 'john.doe@test.com',
                    serviceToken: 'abcd-1234'
                };
                var service = _initService(null, propertyMap);

                for (var prop in propertyMap) {
                    expect(service).to.have.property(prop).and.to.equal(propertyMap[prop]);
                }
            });
        });

        describe('getServiceToken()', function() {
            it('should throw an error if an invalid service key is specified', function() {
                var service = _initService(['user']);
                var error = 'Invalid service key specified (arg #1)';

                function invokeMethod(key) {
                    return function() {
                        return service.getServiceToken(key);
                    };
                }

                expect(invokeMethod()).to.throw(error);
                expect(invokeMethod(null)).to.throw(error);
                expect(invokeMethod('')).to.throw(error);
                expect(invokeMethod(123)).to.throw(error);
                expect(invokeMethod(true)).to.throw(error);
                expect(invokeMethod({
                    foo: 'bar'
                })).to.throw(error);
                expect(invokeMethod(function() {})).to.throw(error);
            });

            it('should return the token associated with the specified service key', function() {
                var serviceTokens = {
                    foo: 'bar'
                };
                var service = _initService(['user'], {
                    _serviceTokens: serviceTokens
                });

                for (var key in serviceTokens) {
                    var token = service.getServiceToken(key);
                    expect(token).to.equal(serviceTokens[key]);
                }
                expect(service.getServiceToken('bad-key')).to.be.undefined;
            });
        });

        describe('hasRole()', function() {
            it('should throw an error if an invalid role is specified', function() {
                var service = _initService(['user']);
                var error = 'Invalid role specified (arg #1)';

                function invokeMethod(role) {
                    return function() {
                        return service.hasRole(role);
                    };
                }

                expect(invokeMethod()).to.throw(error);
                expect(invokeMethod(null)).to.throw(error);
                expect(invokeMethod('')).to.throw(error);
                expect(invokeMethod(123)).to.throw(error);
                expect(invokeMethod(true)).to.throw(error);
                expect(invokeMethod({
                    foo: 'bar'
                })).to.throw(error);
                expect(invokeMethod(function() {})).to.throw(error);
            });

            it('should return false if the user does not have the specified role', function() {
                provider.initialize(['user']);
                var service = $injector.invoke(provider.$get);

                expect(service.hasRole('admin')).to.be.false;
            });

            it('should return true if the user has the specified role', function() {
                provider.initialize(['user']);
                var service = $injector.invoke(provider.$get);

                expect(service.hasRole('user')).to.be.true;
            });

            it('should ignore case when comparing roles', function() {
                provider.initialize(['UsEr']);
                var service = $injector.invoke(provider.$get);

                expect(service.hasRole('uSeR')).to.be.true;
            });
        });
    });
});
