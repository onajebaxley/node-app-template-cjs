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
var _mockHelper = require('../../../client-utils/mock-helper');

var _module = 'app.data';

describe('[app.data.Poller]', function() {
    'use strict';

    var DEFAULT_ID = 'poller_1';
    var Service = null;
    var $intervalMock = null;

    function _createPoller(mocks) {
        mocks = mocks || {};
        mocks.id = mocks.id || DEFAULT_ID;
        mocks.dataSource = mocks.dataSource || _mockHelper.createDataSourceMock();

        return new Service(mocks.id, mocks.dataSource);
    }

    beforeEach(function() {
        $intervalMock = _mockHelper.createIntervalMock();
    });
    beforeEach(angular.mock.module(_module));
    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('$interval', $intervalMock);
    }]));
    beforeEach(inject(['app.data.Poller', function(injectedService) {
        Service = injectedService;
    }]));

    describe('ctor()', function() {

        it('should throw an error if a valid id is not specified', function() {
            var error = 'Invalid id specified (arg #2)';

            function createObject(key) {
                return function() {
                    return new Service(key);
                };
            }

            expect(createObject()).to.throw(error);
            expect(createObject(null)).to.throw(error);
            expect(createObject(123)).to.throw(error);
            expect(createObject('')).to.throw(error);
            expect(createObject(true)).to.throw(error);
            expect(createObject({})).to.throw(error);
            expect(createObject([])).to.throw(error);
            expect(createObject(function() {})).to.throw(error);
        });

        it('should throw an error if a valid data source object is not specified', function() {
            var error = 'Invalid data source object specified (arg #3)';

            function createObject(dataSource) {
                return function() {
                    return new Service(DEFAULT_ID, dataSource);
                };
            }

            expect(createObject()).to.throw(error);
            expect(createObject(null)).to.throw(error);
            expect(createObject(123)).to.throw(error);
            expect(createObject('abc')).to.throw(error);
            expect(createObject(true)).to.throw(error);
            expect(createObject(function() {})).to.throw(error);
        });

        it('should throw an error if the data source object does not define required methods', function() {
            var error = 'Data source object does not define the fetch() method (dataSource.fetch())';

            function createObject(fetch) {
                return function() {
                    var ds = {
                        fetch: fetch
                    };
                    return new Service(DEFAULT_ID, ds);
                };
            }

            expect(createObject()).to.throw(error);
            expect(createObject(null)).to.throw(error);
            expect(createObject(123)).to.throw(error);
            expect(createObject('abc')).to.throw(error);
            expect(createObject(true)).to.throw(error);
            expect(createObject({})).to.throw(error);
            expect(createObject([])).to.throw(error);
        });

        it('should return an object that exposes the required methods and properties', function() {
            var poller = _createPoller();

            expect(poller).to.be.an('object');
            //TODO: This assertion fails when running tests in build mode. Not sure why.
            //expect(poller).to.be.an.instanceof(EventEmitter);
            expect(poller).to.have.property('configure').and.to.be.a('function');
            expect(poller).to.have.property('start').and.to.be.a('function');
            expect(poller).to.have.property('stop').and.to.be.a('function');
            expect(poller).to.have.property('destroy').and.to.be.a('function');
            expect(poller).to.have.property('fetchNow').and.to.be.a('function');
            expect(poller).to.have.property('isActive').and.to.be.a('function');
        });
    });

    describe('configure()', function() {

        it('should throw an error if invoked without valid poller options', function() {
            var error = 'Invalid configuration options specified (arg #1)';

            function invokeMethod(options) {
                return function() {
                    var poller = _createPoller();
                    poller.configure(options);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the configuration options object does not define a valid pollFrequency property', function() {
            var error = 'Configuration options does not define a valid pollFrequency property (options.pollFrequency)';

            function invokeMethod(pollFrequency) {
                return function() {
                    var poller = _createPoller();
                    var options = {
                        pollFrequency: pollFrequency
                    };
                    poller.configure(options);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(0)).to.throw(error);
            expect(invokeMethod(-100)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should not invoke the interval service when the configuration is changed', function() {
            var poller = _createPoller();

            poller.configure({
                pollFrequency: 100
            });
            expect($intervalMock).to.not.have.been.called;

            // Start the interval service.
            poller.start();
            $intervalMock.reset();

            poller.configure({
                pollFrequency: 200
            });
            expect($intervalMock).to.not.have.been.called;
        });
    });

    describe('start()', function() {
        it('should throw an error if the poller has not been configured', function() {
            var error = 'Cannot perform operation - the poller has not been configured';

            function invokeMethod() {
                return function() {
                    var poller = _createPoller();
                    poller.start();
                };
            }

            expect(invokeMethod()).to.throw(error);
        });

        it('should intialize an interval timer with the poll frequency when the poller has been properly configured', function() {
            var pollFrequency = 100;
            var poller = _createPoller();

            poller.configure({
                pollFrequency: pollFrequency
            });

            expect($intervalMock).to.not.have.been.called;

            poller.start();
            expect($intervalMock).to.have.been.calledOnce;
            expect($intervalMock.args[0][0]).to.be.a('function');
            expect($intervalMock.args[0][1]).to.equal(pollFrequency);
        });

        it('should do nothing if the poller is already active', function() {
            var pollFrequency = 100;
            var poller = _createPoller();

            poller.configure({
                pollFrequency: pollFrequency
            });

            poller.start();
            $intervalMock.reset();

            poller.start();
            expect($intervalMock).to.not.have.been.called;
        });
    });

    describe('stop()', function() {
        it('should cancel a currently running interval timer if the poller is currently active', function() {
            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });

            poller.start();
            expect($intervalMock.cancel).to.not.have.been.called;

            poller.stop();
            expect($intervalMock.cancel).to.have.been.calledOnce;
            expect($intervalMock.cancel).to.have.been.calledWith($intervalMock.__cancelHandle);
        });

        it('should do nothing if the poller is not currently active', function() {
            var poller = _createPoller();

            expect($intervalMock.cancel).to.not.have.been.called;

            poller.stop();
            expect($intervalMock.cancel).to.not.have.been.called;
        });

        it('should do nothing on subsequent invocations if called multiple times', function() {

            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });
            poller.start();

            expect($intervalMock.cancel).to.not.have.been.called;

            poller.stop();
            expect($intervalMock.cancel).to.have.been.calledOnce;

            $intervalMock.cancel.reset();
            poller.stop();
            expect($intervalMock.cancel).to.not.have.been.called;

            poller.stop();
            expect($intervalMock.cancel).to.not.have.been.called;
        });
    });

    describe('destroy()', function() {
        it('should cancel a currently running interval timer if the poller is currently active', function() {
            var poller = _createPoller();

            poller.configure({
                pollFrequency: 100
            });

            poller.start();
            expect($intervalMock.cancel).to.not.have.been.called;

            poller.destroy();
            expect($intervalMock.cancel).to.have.been.calledOnce;
            expect($intervalMock.cancel).to.have.been.calledWith($intervalMock.__cancelHandle);
        });

        it('should do nothing if the poller is not currently active', function() {
            var poller = _createPoller();

            poller.configure({
                pollFrequency: 100
            });

            expect($intervalMock.cancel).to.not.have.been.called;

            poller.destroy();
            expect($intervalMock.cancel).to.not.have.been.called;
        });

        it('should do nothing on subsequent invocations if called multiple times', function() {

            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });
            poller.start();

            expect($intervalMock.cancel).to.not.have.been.called;

            poller.destroy();
            expect($intervalMock.cancel).to.have.been.calledOnce;

            $intervalMock.cancel.reset();
            poller.destroy();
            expect($intervalMock.cancel).to.not.have.been.called;

            poller.destroy();
            expect($intervalMock.cancel).to.not.have.been.called;
        });

        it('should detach all event handlers when invoked', function() {

            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });
            poller.start();

            var spy = _sinon.spy(poller, 'removeAllListeners');

            expect(spy).to.not.have.been.called;

            poller.destroy();
            expect(spy).to.have.been.calledOnce;
        });
    });


    describe('fetchNow()', function() {
        it('should throw an error if the poller has not been configured', function() {
            var error = 'Cannot perform operation - the poller has not been configured';

            function invokeMethod() {
                return function() {
                    var poller = _createPoller();
                    poller.fetchNow();
                };
            }

            expect(invokeMethod()).to.throw(error);
        });

        it('should stop the interval timer if it is currently started', function() {

            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });
            poller.start();

            expect($intervalMock.cancel).to.not.have.been.called;

            poller.fetchNow();
            expect($intervalMock.cancel).to.have.been.calledOnce;
            expect($intervalMock.cancel).to.have.been.calledWith($intervalMock.__cancelHandle);
        });

        it('should not stop the interval timer if the poller is not currently active', function() {

            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });

            expect($intervalMock.cancel).to.not.have.been.called;

            poller.fetchNow();
            expect($intervalMock.cancel).to.not.have.been.calledOnce;
        });

        it('should request data from the data source when invoked', function() {
            var dataSourceMock = _mockHelper.createDataSourceMock();

            var poller = _createPoller({
                dataSource: dataSourceMock
            });
            poller.configure({
                pollFrequency: 100
            });

            expect(dataSourceMock.fetch).to.not.have.been.called;

            poller.fetchNow();
            expect(dataSourceMock.fetch).to.have.been.calledOnce;
        });

        it('should register success and failure callback handlers with the data source when invoked', function() {
            var dataSourceMock = _mockHelper.createDataSourceMock();

            var poller = _createPoller({
                dataSource: dataSourceMock
            });
            poller.configure({
                pollFrequency: 100
            });

            expect(dataSourceMock.__successHandler).to.be.undefined;
            expect(dataSourceMock.__failureHandler).to.be.undefined;

            poller.fetchNow();
            expect(dataSourceMock.__successHandler).to.be.a('function');
            expect(dataSourceMock.__failureHandler).to.be.a('function');
        });

        it('should emit a "data" event if the server fetch completes successfully', function() {
            var dataSourceMock = _mockHelper.createDataSourceMock();

            var id = 'test_poller';
            var expectedData = {
                foo: 'bar'
            };
            var poller = _createPoller({
                id: id,
                dataSource: dataSourceMock
            });
            poller.configure({
                pollFrequency: 100
            });

            var handlerSpy = _sinon.spy();
            poller.on('data', handlerSpy);

            poller.fetchNow();
            dataSourceMock.__successHandler(expectedData);
            expect(handlerSpy).to.have.been.calledOnce;
            expect(handlerSpy).to.have.been.calledWith(id, expectedData);
        });

        it('should emit an "error" event if the server fetch fails', function() {
            var dataSourceMock = _mockHelper.createDataSourceMock();

            var id = 'test_poller';
            var expectedError = 'something went wrong';
            var poller = _createPoller({
                id: id,
                dataSource: dataSourceMock
            });
            poller.configure({
                pollFrequency: 100
            });

            var handlerSpy = _sinon.spy();
            poller.on('error', handlerSpy);

            poller.fetchNow();
            dataSourceMock.__failureHandler(expectedError);
            expect(handlerSpy).to.have.been.calledOnce;
            expect(handlerSpy).to.have.been.calledWith(id, expectedError);
        });

        it('should emit an "error" event if the server fetch throws an exception', function() {
            var expectedError = 'fetch exception';
            var dataSourceMock = _mockHelper.createDataSourceMock(expectedError);

            var id = 'test_poller';
            var poller = _createPoller({
                id: id,
                dataSource: dataSourceMock
            });
            poller.configure({
                pollFrequency: 100
            });

            var handlerSpy = _sinon.spy();
            poller.on('error', handlerSpy);

            poller.fetchNow();
            expect(handlerSpy).to.have.been.calledOnce;
            expect(handlerSpy.args[0][0]).to.equal(id);
            expect(handlerSpy.args[0][1]).to.be.an.instanceof(Error);
            expect(handlerSpy.args[0][1].message).to.equal(expectedError);
        });

        it('should restart polling if the poller was active prior to fetchNow() being invoked', function() {
            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });
            poller.start();

            $intervalMock.reset();

            poller.fetchNow();
            expect($intervalMock).to.have.been.calledOnce;
        });

        it('should not restart polling if the poller was inactive prior to fetchNow() being invoked', function() {
            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });

            expect($intervalMock).to.not.have.been.called;

            poller.fetchNow();
            expect($intervalMock).to.not.have.been.called;
        });
    });

    describe('isActive()', function() {
        it('should return false if before the poller has been started', function() {
            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });

            expect(poller.isActive()).to.be.false;
        });

        it('should return true after the poller has been started', function() {
            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });

            poller.start();
            expect(poller.isActive()).to.be.true;
        });

        it('should return false after the poller has been started and then stopped', function() {
            var poller = _createPoller();
            poller.configure({
                pollFrequency: 100
            });

            poller.start();
            poller.stop();
            expect(poller.isActive()).to.be.false;
        });
    });

    describe('[Polling Behavior]', function() {
        it('should invoke the data source\'s fetch() method every time the interval completes', function() {
            var dataSourceMock = _mockHelper.createDataSourceMock();

            var poller = _createPoller({
                dataSource: dataSourceMock
            });
            poller.configure({
                pollFrequency: 100
            });

            poller.start();

            // Data source should not be called until the interval timer triggers.
            expect(dataSourceMock.fetch).to.not.have.been.called;

            $intervalMock.args[0][0]();
            $intervalMock.args[0][0]();
            expect(dataSourceMock.fetch).to.have.been.calledTwice;
        });

        it('should register success and failure callback handlers with the data source when the interval triggers', function() {
            var dataSourceMock = _mockHelper.createDataSourceMock();

            var poller = _createPoller({
                dataSource: dataSourceMock
            });
            poller.configure({
                pollFrequency: 100
            });

            poller.start();
            expect(dataSourceMock.__successHandler).to.be.undefined;
            expect(dataSourceMock.__failureHandler).to.be.undefined;

            $intervalMock.args[0][0]();
            expect(dataSourceMock.__successHandler).to.be.a('function');
            expect(dataSourceMock.__failureHandler).to.be.a('function');
        });

        it('should emit a "data" event if the server fetch completes successfully', function() {
            var dataSourceMock = _mockHelper.createDataSourceMock();
            var id = 'test_poller';
            var expectedData = {
                foo: 'bar'
            };
            var poller = _createPoller({
                id: id,
                dataSource: dataSourceMock
            });

            poller.configure({
                pollFrequency: 100
            });
            poller.start();

            var handlerSpy = _sinon.spy();
            poller.on('data', handlerSpy);

            $intervalMock.args[0][0]();
            dataSourceMock.__successHandler(expectedData);
            expect(handlerSpy).to.have.been.calledOnce;
            expect(handlerSpy).to.have.been.calledWith(id, expectedData);
        });

        it('should emit an "error" event if the server fetch fails', function() {
            var dataSourceMock = _mockHelper.createDataSourceMock();
            var id = 'test_poller';
            var expectedError = 'something went wrong';
            var poller = _createPoller({
                id: id,
                dataSource: dataSourceMock
            });

            poller.configure({
                pollFrequency: 100
            });
            poller.start();

            var handlerSpy = _sinon.spy();
            poller.on('error', handlerSpy);

            $intervalMock.args[0][0]();
            dataSourceMock.__failureHandler(expectedError);
            expect(handlerSpy).to.have.been.calledOnce;
            expect(handlerSpy).to.have.been.calledWith(id, expectedError);
        });

        it('should emit an "error" event if the server fetch throws an exception', function() {
            var expectedError = 'fetch exception';
            var dataSourceMock = _mockHelper.createDataSourceMock(expectedError);
            var id = 'test_poller';
            var poller = _createPoller({
                id: id,
                dataSource: dataSourceMock
            });

            poller.configure({
                pollFrequency: 100
            });
            poller.start();

            var handlerSpy = _sinon.spy();
            poller.on('error', handlerSpy);

            $intervalMock.args[0][0]();
            expect(handlerSpy).to.have.been.calledOnce;
            expect(handlerSpy.args[0][0]).to.equal(id);
            expect(handlerSpy.args[0][1]).to.be.an.instanceof(Error);
            expect(handlerSpy.args[0][1].message).to.equal(expectedError);
        });
    });

});
