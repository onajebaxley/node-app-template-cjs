/* jshint expr:true */
/* global alert:true */

var _angular = require('angular');
var _ngMocks = require('angular-mocks');
var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');
var _module = 'app.data';

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

describe('[app.data.RestDataSource]', function() {
    'use strict';

    function _initQMock() {
        var q = function() {};
        q.__promise = {
            then: _sinon.spy()
        };
        q.__reject = _sinon.spy();
        q.__resolve = _sinon.spy();

        q.defer = function() {
            return {
                promise: q.__promise,
                reject: q.__reject,
                resolve: q.__resolve
            };
        };
        return q;
    }

    function _initResourceMock() {
        var retValue = {
            $promise: {
                then: _sinon.spy()
            }
        };
        var resourceObject = {
            _ret: retValue
        };


        var resource = _sinon.stub().returns(resourceObject);
        resource.__resourceObject = resourceObject;
        resource.__setGetResult = function(error) {
            if (error) {
                resourceObject.get = _sinon.stub().throws(new Error(error));
            } else {
                resourceObject.get = _sinon.stub().returns(retValue);
            }
        };
        return resource;
    }

    var Service = null;
    var $qMock = null;
    var $resourceMock = null;

    beforeEach(function() {
        $resourceMock = _initResourceMock();
        $qMock = _initQMock();
    });
    beforeEach(angular.mock.module(_module));
    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('$resource', $resourceMock);
        $provide.value('$q', $qMock);
    }]));
    beforeEach(inject(['app.data.RestDataSource', function(injectedService) {
        Service = injectedService;
    }]));

    describe('[init]', function() {
        it('should define the necessary fields and methods', function() {
            expect(Service).to.be.a('function');
        });
    });

    describe('[ctor]', function() {
        it('should return an object that exposes the required methods and properties', function() {
            var restDs = new Service();

            expect(restDs).to.be.an('object');
            expect(restDs).to.have.property('configure').and.to.be.a('function');
            expect(restDs).to.have.property('serverFetch').and.to.be.a('function');
        });
    });

});
