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

describe('[app.data.pollerManager]', function() {
    'use strict';

    var Poller = null;
    var DEFAULT_ID = 'poller_1';
    var service = null;
    var $interval = null;

    function _getDataSourceMock(errorMessage) {
        var dataSource = {
            serverFetch: function() {},
            _successHandler: null,
            _failureHandler: null
        };

        _sinon.stub(dataSource, 'serverFetch', function() {
            if (errorMessage) {
                throw new Error(errorMessage);
            }
            var promise = {
                then: function(successHandler, failureHandler) {
                    dataSource.__successHandler = successHandler;
                    dataSource.__failureHandler = failureHandler;
                    return promise;
                }
            };
            return promise;
        });
        return dataSource;
    }

    function _createPoller(mocks) {
        mocks = mocks || {};
        mocks.id = mocks.id || DEFAULT_ID;
        mocks.dataSource = mocks.dataSource || _getDataSourceMock();

        return service.initPoller(mocks.id, mocks.dataSource);
    }

    beforeEach(angular.mock.module(_module));
    beforeEach(inject(['$interval', 'app.data.pollerManager', 'app.data.Poller',
        function(_$interval, injectedService, _Poller) {
            $interval = _$interval;
            service = injectedService;
            Poller = _Poller;
        }
    ]));


    describe('[init]', function() {
        it('should define the necessary fields and methods', function() {
            expect(service).to.be.an('object');

            expect(service).to.have.property('initPoller').and.to.be.a('function');
            expect(service).to.have.property('lookupPoller').and.to.be.a('function');
            expect(service).to.have.property('getPollerIds').and.to.be.a('function');
            expect(service).to.have.property('deletePoller').and.to.be.a('function');
            expect(service).to.have.property('deleteAll').and.to.be.a('function');
        });
    });

    describe('initPoller()', function() {
        it('should throw an error if an invalid poller id is specified', function() {
            var error = 'Invalid poller id specified (arg #1)';

            function invokeMethod(id) {
                return function() {
                    return service.initPoller(id);
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

        it('should throw an error if a valid data source object is not specified', function() {
            var error = 'Invalid data source object specified (arg #2)';

            function invokeMethod(dataSource) {
                return function() {
                    return service.initPoller(DEFAULT_ID, dataSource);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should return a poller object when invoked with valid arguments', function() {
            var poller = service.initPoller('test_poller', _getDataSourceMock());
            expect(poller).to.be.an.instanceof(Poller);
        });

        it('should throw an error if a poller with the specified id has already been initialized', function() {
            var pollerId = 'test_poller';
            var error = 'A poller with the specified id [' + pollerId + '] has already been created';

            function invokeMethod(id) {
                return function() {
                    var dataSource = _getDataSourceMock();
                    service.initPoller(id, dataSource);
                    return service.initPoller(id, dataSource);
                };
            }

            expect(invokeMethod(pollerId)).to.throw(error);
        });
    });

    describe('lookupPoller()', function() {
        it('should throw an error if an invalid poller id is specified', function() {
            var error = 'Invalid poller id specified (arg #1)';

            function invokeMethod(id) {
                return function() {
                    return service.lookupPoller(id);
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

        it('should return a poller object if one exists with the specified id', function() {
            var pollerId = 'test_poller';
            _createPoller({
                id: pollerId
            });

            var ret = service.lookupPoller(pollerId);
            expect(ret).to.be.an.instanceof(Poller);
        });

        it('should return undefined if no poller has been created with the specified id', function() {
            var pollerId = 'bad_id';

            var ret = service.lookupPoller(pollerId);
            expect(ret).to.be.undefined;
        });
    });

    describe('getPollerIds()', function() {
        it('should return an empty array if no pollers have been registered', function() {
            var ret = service.getPollerIds();

            expect(ret).to.be.an.instanceof(Array);
            expect(ret).to.be.empty;
        });

        it('should return an array of strings containing the id of every poller that has been registered with the manager', function() {
            var pollerIds = ['poller_1', 'poller_2', 'poller_3', 'poller_4', 'poller_5'];

            for (var index = 0; index < pollerIds.length; index++) {
                _createPoller({
                    id: pollerIds[index]
                });
            }
            var ret = service.getPollerIds();
            expect(ret).to.deep.equal(pollerIds);
        });
    });

    describe('deletePoller()', function() {
        it('should do nothing if a poller with the specified id does not exist', function() {
            var pollerId = 'bad_id';

            function invokeMethod(id) {
                return function() {
                    service.deletePoller(id);
                };
            }

            expect(invokeMethod()).to.not.throw();
        });

        it('should delete a poller from the manager if a poller with the specified id exists', function() {
            var pollerId = 'test_poller';
            _createPoller({
                id: pollerId
            });

            service.deletePoller(pollerId);
            var ret = service.lookupPoller(pollerId);
            expect(ret).to.be.undefined;
        });

        it('should stop the poller if it is active before deleting it from the manager', function() {
            var pollerId = 'test_poller';
            var poller = _createPoller({
                id: pollerId
            });
            poller.configure({
                pollFrequency: 100
            });

            var spy = _sinon.spy(poller, 'stop');

            poller.start();
            $interval.flush();

            expect(spy).to.not.have.been.called;
            service.deletePoller(pollerId);
            expect(spy).to.have.been.calledOnce;
        });

        it('should detach all event handlers from the poller prior to deleting it', function() {
            var pollerId = 'test_poller';
            var poller = _createPoller({
                id: pollerId
            });
            poller.configure({
                pollFrequency: 100
            });

            var spy = _sinon.spy(poller, 'removeAllListeners');

            poller.start();
            $interval.flush();

            expect(spy).to.not.have.been.called;
            service.deletePoller(pollerId);
            expect(spy).to.have.been.calledOnce;
        });
    });

    describe('deleteAll()', function() {
        it('should do nothing if no pollers have been registered with the manager', function() {
            function invokeMethod(id) {
                return function() {
                    service.deleteAll();
                };
            }

            expect(invokeMethod()).to.not.throw();
        });

        it('should delete all pollers from the manager', function() {
            var pollerIds = ['poller_1', 'poller_2', 'poller_3', 'poller_4', 'poller_5'];

            for (var index = 0; index < pollerIds.length; index++) {
                _createPoller({
                    id: pollerIds[index]
                });
            }
            var ret = service.getPollerIds();
            expect(ret).to.deep.equal(pollerIds);

            service.deleteAll();
            ret = service.getPollerIds();
            expect(ret).to.be.empty;
        });

        it('should stop the poller if it is active before deleting it from the manager', function() {
            var pollerIds = ['poller_1', 'poller_2', 'poller_3', 'poller_4', 'poller_5'];
            var spies = [];

            for (var index = 0; index < pollerIds.length; index++) {
                var poller = _createPoller({
                    id: pollerIds[index]
                });
                spies.push(_sinon.spy(poller, 'stop'));

                poller.configure({
                    pollFrequency: 100
                });
                poller.start();
                $interval.flush();
            }

            for (index = 0; index < pollerIds.length; index++) {
                expect(spies[index]).to.not.have.been.called;
            }

            service.deleteAll();

            for (index = 0; index < pollerIds.length; index++) {
                expect(spies[index]).to.have.been.calledOnce;
            }
        });

        it('should remove all listeners the poller if it is active before deleting it from the manager', function() {
            var pollerIds = ['poller_1', 'poller_2', 'poller_3', 'poller_4', 'poller_5'];
            var spies = [];

            for (var index = 0; index < pollerIds.length; index++) {
                var poller = _createPoller({
                    id: pollerIds[index]
                });
                spies.push(_sinon.spy(poller, 'removeAllListeners'));

                poller.configure({
                    pollFrequency: 100
                });
                poller.start();
                $interval.flush();
            }

            for (index = 0; index < pollerIds.length; index++) {
                expect(spies[index]).to.not.have.been.called;
            }

            service.deleteAll();

            for (index = 0; index < pollerIds.length; index++) {
                expect(spies[index]).to.have.been.calledOnce;
            }
        });
    });

});
