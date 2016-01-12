/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var User = require('../../../server/lib/user');

describe('server.lib.User', function() {
    describe('ctor()', function() {
        it('should throw an error if a valid username is not specified', function() {
            var error = 'Invalid user name specified (arg #1)';

            function invokeMethod(username) {
                return function() {
                    return new User(username);
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
            expect(invokeMethod([1, 2, 3])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should return an object with the expected properties and methods', function() {
            var user = new User('jdoe');

            expect(user).to.be.an('object');
            expect(user).to.have.property('hasRole').and.to.be.a('function');
            expect(user).to.have.property('getRoles').and.to.be.a('function');
            expect(user).to.have.property('serialize').and.to.be.a('function');
            expect(user).to.have.property('setServiceToken').and.to.be.a('function');
            expect(user).to.have.property('getServiceToken').and.to.be.a('function');
        });

        it('should default the roles collection to an empty array if no roles were passed during initialization', function() {
            var user = new User('jdoe');

            expect(user._roles).to.be.an('Array');
            expect(user._roles).to.be.empty;
        });

        it('should include all properties that were passed during initialization', function() {
            var propertyMap = {
                firstName: 'john',
                lastName: 'doe',
                email: 'john.doe@test.com',
                serviceToken: 'abcd-1234'
            };
            var user = new User('jdoe', [], propertyMap);

            for (var prop in propertyMap) {
                expect(user).to.have.property(prop).and.to.equal(propertyMap[prop]);
            }
        });

        it('should define a default "_serviceTokens" property even if one was not specified during initialization', function() {
            var user = new User('jdoe');

            expect(user._serviceTokens).to.not.be.an('Array');
            expect(user._serviceTokens).to.be.an('object');
            expect(user._serviceTokens).to.be.empty;
        });
    });

    describe('hasRole()', function() {
        it('should throw an error if an invalid role is specified', function() {
            var error = 'Invalid role specified (arg #1)';

            var invokeMethod = function(role) {
                return function() {
                    var user = new User('jdoe');
                    return user.hasRole(role);
                };
            };

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should return false if the user does not have the specified role', function() {
            var user = new User('jdoe', ['user']);

            expect(user.hasRole('admin')).to.be.false;
        });

        it('should return true if the user has the specified role', function() {
            var user = new User('jdoe', ['user']);

            expect(user.hasRole('user')).to.be.true;
        });

        it('should ignore case when comparing roles', function() {
            var user = new User('jdoe', ['USER']);

            expect(user.hasRole('user')).to.be.true;
        });

        it('should ignore case when comparing roles', function() {
            var user = new User('jdoe', ['UsEr']);

            expect(user.hasRole('uSeR')).to.be.true;
        });
    });

    describe('getRoles()', function() {
        it('should return an empty array if no roles were passed during initialization', function() {
            var user = new User('jdoe');

            expect(user.getRoles()).to.be.an('Array');
            expect(user.getRoles()).to.be.empty;
        });

        it('should return an array of roles (in lowercase) that were passed during initialization', function() {
            var roles = ['UseR', 'aDMin', 'manager', 'CEO'];
            var user = new User('jdoe', roles);

            var userRoles = user.getRoles();
            expect(userRoles).to.have.length(roles.length);
            expect(userRoles).to.deep.equal(roles.map(function(role) {
                return role.toLowerCase();
            }));
        });

        it('should return a copy of the roles, not a reference', function() {
            var roles = ['UseR', 'aDMin', 'manager', 'CEO'];
            var user = new User('jdoe', roles);

            var userRoles = user.getRoles();
            expect(userRoles).to.not.equal(roles);
            expect(userRoles).to.not.equal(user._roles);
        });
    });

    describe('setServiceToken()', function() {

        it('should throw an error if invoked without a valid service key', function() {
            var error = 'Invalid service key specified (arg #1)';
            function invoke(key) {
                return function() {
                    var user = new User('jdoe');
                    return user.setServiceToken(key);
                };
            }
            
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should throw an error if invoked without a valid service token', function() {
            var error = 'Invalid service token specified (arg #2)';
            function invoke(token) {
                return function() {
                    var user = new User('jdoe');
                    return user.setServiceToken('service1', token);
                };
            }
            
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should store the service token in an internal map when a valid key and token are specified', function() {
            var user = new User('jdoe');
            var serviceTokens = {
                service1: 'service1_token',
                service2: 'service2_token',
                service3: 'service3_token',
                service4: 'service4_token',
            };
            var serviceName = null;

            //NOTE: Inspecting private members
            expect(user._serviceTokens).to.be.an('object').and.to.be.empty;

            for(serviceName in serviceTokens) {
                user.setServiceToken(serviceName, serviceTokens[serviceName]);
            }
            for(serviceName in serviceTokens) {
                //NOTE: Inspecting private members
                expect(user._serviceTokens[serviceName]).to.equal(serviceTokens[serviceName]);
            }
        });

    });

    describe('getServiceToken()', function() {

        it('should throw an error if invoked without a valid service key', function() {
            var error = 'Invalid service key specified (arg #1)';
            function invoke(key) {
                return function() {
                    var user = new User('jdoe');
                    return user.getServiceToken(key);
                };
            }
            
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should return the service token associated with the specified service key when invoked with a valid service key', function() {
            var user = new User('jdoe');
            var serviceTokens = {
                service1: 'service1_token',
                service2: 'service2_token',
                service3: 'service3_token',
                service4: 'service4_token',
            };
            var serviceName = null;

            for(serviceName in serviceTokens) {
                //NOTE: Altering private members
                user._serviceTokens[serviceName] = serviceTokens[serviceName];
            }
            for(serviceName in serviceTokens) {
                expect(user.getServiceToken(serviceName)).to.equal(serviceTokens[serviceName]);
            }
        });
    });

    describe('serialize()', function() {

        it('should return an object that includes the username and extended properties when invoked', function() {
            var username = 'jdoe';
            var extendedProperties = {
                firstName: 'John',
                lastName: 'Doe'
            };
            var moreExtendedProperties = {
                location: 'nowhere',
                title: 'grand vizier'
            };
            var key = null;

            var user = new User('jdoe', null, extendedProperties);
            for(key in moreExtendedProperties) {
                user[key] = moreExtendedProperties[key];
            }

            var properties = user.serialize();

            expect(properties).to.be.an('object');
            expect(properties.username).to.equal(username);
            for(key in extendedProperties) {
                expect(properties[key]).to.equal(extendedProperties[key]);
            }
            for(key in moreExtendedProperties) {
                expect(properties[key]).to.equal(moreExtendedProperties[key]);
            }
        });

        it('should return an object that includes roles and service tokens when invoked', function() {
            var username = 'jdoe';
            var roles = [ 'user', 'admin', 'manager' ];
            var serviceTokens = {
                service1: 'service1_token',
                service2: 'service2_token',
                service3: 'service3_token',
                service4: 'service4_token',
            };
            var user = new User('jdoe', roles);
            for(var serviceName in serviceTokens) {
                user.setServiceToken(serviceName, serviceTokens[serviceName]);
            }
            var properties = user.serialize();

            expect(properties).to.be.an('object');
            expect(properties.username).to.equal(username);
            expect(properties._roles).to.deep.equal(roles);
            expect(properties._serviceTokens).to.deep.equal(serviceTokens);
        });

        it('should exclude all functions during serialization', function() {
            var username = 'jdoe';
            var user = new User('jdoe');
            var properties = user.serialize();

            expect(properties).to.be.an('object');
            expect(properties).to.not.have.property('hasRole');
            expect(properties).to.not.have.property('getRole');
            expect(properties).to.not.have.property('setServiceToken');
            expect(properties).to.not.have.property('getServiceToken');
            expect(properties).to.not.have.property('serialize');
        });
    });

});
