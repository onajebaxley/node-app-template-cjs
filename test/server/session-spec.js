/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _rewire = require('rewire');

var _appHelper = require('../utils/app-helper');
var _configHelper = require('../utils/config-helper');
var _loggerHelper = require('../utils/logger-helper');
var _session = null;

describe('[server.session]', function() {

    var _sessionParams = {
        cookieName: 'session_cookie_123',
        secretKey: 'abcd1234',
        secureProxy: true
    };

    beforeEach(function() {
        _session = _rewire('../../server/session');

        _configHelper.setConfig('cfg_session_cookie_name', _sessionParams.cookieName);
        _configHelper.setConfig('cfg_session_secret', _sessionParams.secretKey);
        _configHelper.setConfig('cfg_session_secure_proxy', _sessionParams.secureProxy);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('[init]', function() {
        it('should expose the necessary fields and methods', function() {
            expect(_session).to.have.property('configure').and.to.be.a('function');
            expect(_session).to.have.property('getSessionHandler').and.to.be.a('function');
        });
    });

    describe('configure()', function() {
        it('should throw an error if invoked without a valid app object', function() {
            var error = 'Invalid app object specified (arg #1)';

            var invokeMethod = function(app) {
                return function() {
                    _session.configure(app);
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

        it('should initialize the session handler map and session options when invoked', function() {
            expect(_session.__get__('_sessionOptions')).to.be.null;
            expect(_session.__get__('_sessionHandlerMap')).to.be.null;

            _session.configure(_appHelper.getMockApp());

            var sessionOptions = _session.__get__('_sessionOptions');
            var sessionHandlerMap = _session.__get__('_sessionHandlerMap');

            expect(sessionOptions).to.be.an('object');
            expect(sessionOptions.name).to.equal(_sessionParams.cookieName);
            expect(sessionOptions.secret).to.equal(_sessionParams.secretKey);
            expect(sessionOptions.secureProxy).to.equal(_sessionParams.secureProxy);
            expect(sessionOptions.httpOnly).to.be.true;
            expect(sessionOptions.signed).to.be.true;

            expect(sessionHandlerMap).to.be.an('object');
            expect(sessionHandlerMap).to.be.empty;
        });

        it('should have no impact if invoked multiple times', function() {
            _session.configure(_appHelper.getMockApp());

            var sessionOptions = _session.__get__('_sessionOptions');
            var sessionHandlerMap = _session.__get__('_sessionHandlerMap');

            expect(sessionHandlerMap).to.be.an('object');
            expect(sessionOptions).to.be.an('object');

            _session.configure(_appHelper.getMockApp());

            expect(sessionOptions).to.equal(_session.__get__('_sessionOptions'));
            expect(sessionHandlerMap).to.equal(_session.__get__('_sessionHandlerMap'));
        });
    });

    describe('getSessionHandler()', function() {
        
        beforeEach(function() {
            _session.configure(_appHelper.getMockApp());
        });

        it('should return a session handler function when invoked', function() {
           var handler = _session.getSessionHandler(); 

           expect(handler).to.be.a('function');
        });

        it('should return the same handler function when invoked with the same path parameter', function() {
            var handler1 = _session.getSessionHandler('/path1');
            var handler2 = _session.getSessionHandler('/path1');

            expect(handler1).to.equal(handler2);
        });

        it('should return different handler functions when invoked with different path parameters', function() {
            var handler1 = _session.getSessionHandler('/path1');
            var handler2 = _session.getSessionHandler('/path2');

            expect(handler1).to.not.equal(handler2);
        });

        it('should default the path to "/" if a valid path is not specified', function() {
            var handler1 = _session.getSessionHandler('/');
            var handler2 = _session.getSessionHandler('');
            var handler3 = _session.getSessionHandler();

            expect(handler3).to.equal(handler1);
            expect(handler3).to.equal(handler2);
        });
    });

});
