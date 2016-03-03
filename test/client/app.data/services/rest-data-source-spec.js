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
            var dataSource = new Service();

            expect(dataSource).to.be.an('object');
            expect(dataSource).to.have.property('configure').and.to.be.a('function');
            expect(dataSource).to.have.property('serverFetch').and.to.be.a('function');
        });
    });

    describe('configure()', function() {
        it('should throw an error if invoked without valid configuration options', function() {
            var error = 'Invalid configuration options specified (arg #1)';

            function invokeMethod(options) {
                return function() {
                    var dataSource = new Service();
                    dataSource.configure(options);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the configuration options object does not define a valid url property', function() {
            var error = 'Configuration options does not define a valid url property (configOptions.url)';

            function invokeMethod(url) {
                return function() {
                    var dataSource = new Service();
                    var options = {
                        url: url
                    };
                    dataSource.configure(options);
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

        it('should invoke the $resource object with parameters from the configuration options object', function() {
            var dataSource = new Service();
            var options = {
                url: 'http://server/api',
                paramDefaults: {
                    foo: 'bar',
                    abc: 123
                },
                actions: {
                    get: {
                        action: 'GET',
                        isArray: false
                    }
                }
            };

            expect($resourceMock).to.not.have.been.called;
            dataSource.configure(options);

            expect($resourceMock).to.have.been.calledOnce;
            expect($resourceMock).to.have.been.calledWith(options.url,
                options.paramDefaults,
                options.actions);
        });
    });

    describe('serverFetch()', function() {
        it('should throw an error if invoked before the data source has been configured', function() {
            var error = 'Cannot perform operation - the data source has not been configured';

            function invokeMethod() {
                return function() {
                    var dataSource = new Service();
                    dataSource.serverFetch();
                };
            }

            expect(invokeMethod()).to.throw(error);
        });

        it('should invoke the get method of the resource object when invoked', function() {
            var dataSource = new Service();
            dataSource.configure({
                url: 'http://server/api'
            });
            $resourceMock.__setGetResult();

            expect($resourceMock.__resourceObject.get).to.not.have.been.called;
            dataSource.serverFetch();
            expect($resourceMock.__resourceObject.get).to.have.been.calledOnce;
        });

        it('should return a promise when invoked', function() {
            var dataSource = new Service();
            dataSource.configure({
                url: 'http://server/api'
            });
            $resourceMock.__setGetResult();

            var ret = dataSource.serverFetch();
            expect(ret).to.equal($qMock.__promise);
        });

        it('should resolve the promise if the resource object returns success', function() {
            var dataSource = new Service();
            var expectedData = {
                foo: 'bar',
                abc: '123',
            };
            var dsPromise = $resourceMock.__resourceObject._ret.$promise;
            dataSource.configure({
                url: 'http://server/api'
            });
            $resourceMock.__setGetResult();

            var ret = dataSource.serverFetch();

            expect(dsPromise.then).to.have.been.calledOnce;
            var successHandler = dsPromise.then.args[0][0];

            expect($qMock.__resolve).to.not.have.been.called;
            successHandler(expectedData);
            expect($qMock.__resolve).to.have.been.calledOnce;
            expect($qMock.__resolve).to.have.been.calledWith(expectedData);
        });

        it('should reject the promise if the resource object returns an error', function() {
            var dataSource = new Service();
            var expectedError = 'something went wrong';
            var dsPromise = $resourceMock.__resourceObject._ret.$promise;
            dataSource.configure({
                url: 'http://server/api'
            });
            $resourceMock.__setGetResult();

            var ret = dataSource.serverFetch();

            expect(dsPromise.then).to.have.been.calledOnce;
            var failureHandler = dsPromise.then.args[0][1];

            expect($qMock.__reject).to.not.have.been.called;
            failureHandler(expectedError);
            expect($qMock.__reject).to.have.been.calledOnce;
            expect($qMock.__reject).to.have.been.calledWith(expectedError);
        });

        it('should reject the promise if the resource object throws an exception', function() {
            var expectedError = 'resource exception';
            var dataSource = new Service();
            var dsPromise = $resourceMock.__resourceObject._ret.$promise;
            dataSource.configure({
                url: 'http://server/api'
            });
            $resourceMock.__setGetResult(expectedError);

            expect($qMock.__reject).to.not.have.been.called;
            var ret = dataSource.serverFetch();

            expect($qMock.__reject).to.have.been.calledOnce;
            expect($qMock.__reject.args[0][0].message).to.equal(expectedError);
        });
    });

});
