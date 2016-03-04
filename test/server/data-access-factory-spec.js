/* jshint node:true, expr:true */
'use strict';

var _util = require('util');
var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _rewire = require('rewire');

var _appHelper = require('../server-utils/app-helper');
var _configHelper = require('../server-utils/config-helper');
var _loggerHelper = require('../server-utils/logger-helper');
var DataAccess = require('../../server/data/data-access');
var _dataAccessFactory = null;

describe('[server.dataAccessFactory]', function() {

    beforeEach(function() {
        _dataAccessFactory = _rewire('../../server/data-access-factory');
        _dataAccessFactory.__set__('_logger', _loggerHelper.initLogger(true));
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    //TODO: The current factory object initializes dummy data access objects, and this
    //needs to be replaced with a more meaningful real world implementation. At that time,
    //these test cases will have to be revised appropriately.
    describe('[init]', function() {
        it('should expose the necessary fields and methods', function() {
            expect(_dataAccessFactory).to.have.property('configure').and.to.be.a('function');
            expect(_dataAccessFactory).to.have.property('getDataAccessObject').and.to.be.a('function');
        });
    });

    describe('configure()', function() {
        it('should throw an error if invoked without a valid app object', function() {
            var error = 'Invalid app object specified (arg #1)';

            var invokeMethod = function(app) {
                return function() {
                    _dataAccessFactory.configure(app);
                };
            };

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
        });

        it('should initialize the data access object map when invoked', function() {
            expect(_dataAccessFactory.__get__('_dataAccessObjectMap')).to.be.null;

            _dataAccessFactory.configure(_appHelper.getMockApp());
            var daoMap = _dataAccessFactory.__get__('_dataAccessObjectMap');

            expect(daoMap).to.be.an('object');
        });

        it('should initialize the required data access objects when invoked', function() {
            //TODO: More data access objects may be added later.
            var userProfileClass = _sinon.stub().returns({});

            _dataAccessFactory.__set__('UserProfileDataAccess', userProfileClass);

            expect(userProfileClass).to.not.have.been.called;

            _dataAccessFactory.configure(_appHelper.getMockApp());

            expect(userProfileClass).to.have.been.calledOnce;
            expect(userProfileClass).to.have.been.calledWithNew;
        });

        it('should have no impact if invoked multiple times', function() {
            _dataAccessFactory.configure(_appHelper.getMockApp());
            var daoMap = _dataAccessFactory.__get__('_dataAccessObjectMap');

            expect(daoMap).to.be.an('object');

            _dataAccessFactory.configure(_appHelper.getMockApp());

            expect(daoMap).to.equal(_dataAccessFactory.__get__('_dataAccessObjectMap'));
        });
    });

    describe('getDataAccessObject()', function() {

        it('should throw an error if invoked with an invalid key', function() {
            _dataAccessFactory.configure(_appHelper.getMockApp());
            var error = 'Invalid data access object key specified (arg #1)';

            function invoke(key) {
                return function() {
                    _dataAccessFactory.getDataAccessObject(key);
                };
            }

            expect(invoke(null)).to.throw(error);
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should throw an error if no data access object has been defined with the specified key', function() {
            _dataAccessFactory.configure(_appHelper.getMockApp());
            var message = 'Could not find data access object with key: [%s]';

            function invoke(key) {
                return function() {
                    _dataAccessFactory.getDataAccessObject(key);
                };
            }

            expect(invoke('foo')).to.throw(_util.format(message, 'foo'));
            expect(invoke('bar')).to.throw(_util.format(message, 'bar'));
            expect(invoke('baz')).to.throw(_util.format(message, 'baz'));
        });

        it('should return a data access object when a valid dao key is specified', function() {
            _dataAccessFactory.configure(_appHelper.getMockApp());
            var ret = _dataAccessFactory.getDataAccessObject('user-profile');

            expect(ret).to.be.an('object');
            expect(ret).to.be.an.instanceof(DataAccess);
        });
    });
});
