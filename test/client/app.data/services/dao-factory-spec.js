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

var _module = 'app.data';
var _mockHelper = require('../../../client-utils/mock-helper');

describe('[app.data.daoFactory]', function() {
    'use strict';

    var API_URL = 'http://api-server/api';
    var API_KEY = 'jwt-token';
    var factory = null;
    var userMock = null;
    var configMock = null;
    var $resourceMock = null;

    beforeEach(function() {
        $resourceMock = _mockHelper.createResourceMock();
        userMock = _mockHelper.createUserMock('jdoe', [], {
            'api': API_KEY
        });
        configMock = _mockHelper.createConfigMock();
        configMock.set('api_url', API_URL);
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('$resource', $resourceMock);
        $provide.value('app.core.config', configMock);
        $provide.value('app.core.user', userMock);
    }]));

    beforeEach(inject(['app.data.daoFactory', function(injectedFactory, injectedMenuItem) {
        factory = injectedFactory;
    }]));

    describe('[init]', function() {
        it('should define the necessary fields and methods', function() {
            expect(factory).to.be.an('object');

            expect(factory).to.have.property('buildApiDao').and.to.be.a('function');
        });
    });

    describe('buildApiDao()', function() {
        it('should throw an error if invoked without a valid api url path', function() {
            var error = 'Invalid api path specified (arg #1)';

            function invokeMethod(path) {
                return function() {
                    factory.buildApiDao(path);
                };
            }

            expect(invokeMethod(undefined)).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should return a $resource object with crud methods when invoked with a valid url path', function() {
            var expectedObject = $resourceMock();
            var dao = factory.buildApiDao('/some/path');

            expect(dao).to.be.an('object');
            expect(dao).to.equal(expectedObject);
        });

        it('should configure the $resource object with the correct API url', function() {
            var path = '/some/path';
            var defaults = {};
            $resourceMock.reset();

            function verifyCrudMethodConfig(config, method, isArray) {
                expect(config).to.be.an('object');
                expect(config.method).to.equal(method);
                expect(config.headers).to.be.an('object');
                expect(config.headers.Authorization).to.equal('bearer ' + API_KEY);
                expect(config.headers.Accept).to.equal('application/json');
                switch (method) {
                    case 'POST':
                        expect(config.headers['Content-Type']).to.equal('application/json');
                        break;
                    case 'GET':
                        expect(config.isArray).to.equal(!!isArray);
                        break;
                };
            }

            var dao = factory.buildApiDao(path, defaults);
            expect($resourceMock).to.have.been.calledOnce;
            expect($resourceMock.args[0][0]).to.equal(API_URL + path);
            expect($resourceMock.args[0][1]).to.deep.equal(defaults);

            var crudMethods = $resourceMock.args[0][2];
            expect(crudMethods).to.be.an('object');
            verifyCrudMethodConfig(crudMethods.fetch, 'GET', true);
            verifyCrudMethodConfig(crudMethods.fetchOne, 'GET', false);
            verifyCrudMethodConfig(crudMethods.fetchList, 'GET', true);
            verifyCrudMethodConfig(crudMethods.save, 'POST');
            verifyCrudMethodConfig(crudMethods.delete, 'DELETE');
        });
    });
});
