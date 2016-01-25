/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _q = require('q');
var _rewire = require('rewire');

var User = require('../../server/lib/user');
var InvalidSessionError = require('../../server/lib/invalid-session-error');
var _assertionHelper = require('wysknd-test').assertionHelper;

var _appHelper = require('../utils/app-helper');
var _configHelper = require('../utils/config-helper');
var _loggerHelper = require('../utils/logger-helper');
var _dataAccessFactoryHelper = require('../utils/data-access-factory-helper');
var _expressMocks = require('../utils/express-mocks');
var _auth = null;

describe('[server.auth]', function() {
    var _passportMock = null;
    var _sessionTokenVersion = '1.0';
    var _sessionTimeout = 1000;
    var VALID_USERNAME = 'pparker';

    beforeEach(function() {
        _passportMock = {
            use: _sinon.spy(),
            serializeUser: _sinon.spy(),
            deserializeUser: _sinon.spy()
        };

        _auth = _rewire('../../server/auth');
        _auth.__set__('_passport', _passportMock);
        _auth.__set__('_logger', _loggerHelper.initLogger(true));
        _auth.__set__('_dataAccessFactory', _dataAccessFactoryHelper.initDataAccessFactory(true));

        _configHelper.setConfig('cfg_session_token_version', _sessionTokenVersion);
        _configHelper.setConfig('cfg_session_timeout', _sessionTimeout);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('[init]', function() {
        it('should expose the necessary fields and methods', function() {
            expect(_auth).to.have.property('configure').and.to.be.a('function');
            expect(_auth).to.have.property('ensureUserSession').and.to.be.a('function');
        });
    });

    describe('configure()', function() {

        function _getCompletionSpy() {
            var def = _q.defer();
            var container = {
                promise: def.promise,
                spy: function() {}
            };
            _sinon.stub(container, 'spy', function() {
                def.resolve();
            });

            return container;
        }

        it('should throw an error if invoked without a valid app object', function() {
            var error = 'Invalid app object specified (arg #1)';

            var invokeMethod = function(app) {
                return function() {
                    _auth.configure(app);
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

        it('should register a strategy for authentication and handlers for user serialization and deserialization', function() {
            expect(_passportMock.use).to.not.have.been.called;
            expect(_passportMock.serializeUser).to.not.have.been.called;
            expect(_passportMock.deserializeUser).to.not.have.been.called;

            _auth.configure(_appHelper.getMockApp());

            expect(_passportMock.use).to.have.been.calledOnce;
            expect(_passportMock.serializeUser).to.have.been.calledOnce;
            expect(_passportMock.deserializeUser).to.have.been.calledOnce;
        });

        it('should have no impact if invoked multiple times', function() {
            _auth.configure(_appHelper.getMockApp());
            _passportMock.use.reset();
            _passportMock.serializeUser.reset();
            _passportMock.deserializeUser.reset();

            _auth.configure(_appHelper.getMockApp());
            expect(_passportMock.use).to.not.have.been.called;
            expect(_passportMock.serializeUser).to.not.have.been.called;
            expect(_passportMock.deserializeUser).to.not.have.been.called;
        });

        describe('[serializer]', function() {
            var _serializer = null;

            beforeEach(function() {
                _auth.configure(_appHelper.getMockApp());
                _serializer = _passportMock.serializeUser.args[0][0];
            });

            it('should return an empty object if a valid user object is not specified', function() {
                function checkSerialization(user) {
                    var serializerComplete = _getCompletionSpy();
                    _serializer(user, serializerComplete.spy);

                    expect(serializerComplete.spy).to.have.been.calledOnce;
                    var userToken = serializerComplete.spy.args[0][1];
                    expect(userToken).to.be.an('object');
                    expect(userToken).to.empty;
                }

                checkSerialization(null);
                checkSerialization(undefined);
                checkSerialization(123);
                checkSerialization('abc');
                checkSerialization(true);
                checkSerialization([]);
                checkSerialization({});
                checkSerialization(function() {});
            });

            it('should return an empty object if the user object does not define a valid username', function() {
                function checkSerialization(username) {
                    var user = {
                        username: username
                    };
                    var serializerComplete = _getCompletionSpy();
                    _serializer(user, serializerComplete.spy);

                    expect(serializerComplete.spy).to.have.been.calledOnce;
                    var userToken = serializerComplete.spy.args[0][1];
                    expect(userToken).to.be.an('object');
                    expect(userToken).to.empty;
                }

                checkSerialization(null);
                checkSerialization(undefined);
                checkSerialization(123);
                checkSerialization('');
                checkSerialization(true);
                checkSerialization([]);
                checkSerialization({});
                checkSerialization(function() {});
            });

            it('should return an empty object if the user object does not define a valid session timestamp', function() {
                function checkSerialization(sessionTimestamp) {
                    var user = {
                        username: VALID_USERNAME,
                        sessionTimestamp: sessionTimestamp
                    };
                    var serializerComplete = _getCompletionSpy();
                    _serializer(user, serializerComplete.spy);

                    expect(serializerComplete.spy).to.have.been.calledOnce;
                    var userToken = serializerComplete.spy.args[0][1];
                    expect(userToken).to.be.an('object');
                    expect(userToken).to.empty;
                }

                checkSerialization(null);
                checkSerialization(undefined);
                checkSerialization(0);
                checkSerialization(-1);
                checkSerialization('abc');
                checkSerialization(true);
                checkSerialization([]);
                checkSerialization({});
                checkSerialization(function() {});
            });

            it('should return a serialized user token object when a valid user object is specified', function() {
                var username = VALID_USERNAME;
                var sessionTimestamp = Date.now();
                var serviceTokens = {
                    'service1': 'service1_token',
                    'service2': 'service2_token',
                    'service3': 'service3_token'
                };

                var user = new User(username);
                user.sessionTimestamp = sessionTimestamp;
                for (var serviceName in serviceTokens) {
                    user.setServiceToken(serviceName, serviceTokens[serviceName]);
                }


                var serializerComplete = _getCompletionSpy();
                _serializer(user, serializerComplete.spy);

                expect(serializerComplete.spy).to.have.been.calledOnce;

                var userToken = serializerComplete.spy.args[0][1];
                expect(userToken).to.be.an('object');
                expect(userToken.username).to.equal(username);
                expect(userToken.sessionTimestamp).to.be.within(sessionTimestamp, sessionTimestamp + 10);
                expect(userToken.sessionTokenVersion).to.equal(_sessionTokenVersion);
                expect(userToken.serviceTokens).to.deep.equal(serviceTokens);
                expect(userToken.serviceTokens).to.not.equal(user._serviceTokens);
            });
        });

        describe('[deserializer]', function() {
            var _deserializer = null;


            beforeEach(function() {
                _auth.configure(_appHelper.getMockApp());
                _deserializer = _passportMock.deserializeUser.args[0][0];
            });

            it('should return an error if an invalid user token is specified', function() {
                function checkDeserialize(userToken) {
                    var deserializerComplete = _getCompletionSpy();
                    _deserializer(userToken, deserializerComplete.spy);

                    expect(deserializerComplete.spy).to.have.been.calledOnce;
                    var deserializeError = deserializerComplete.spy.args[0][0];
                    expect(deserializeError).to.be.an.instanceof(InvalidSessionError);
                }

                checkDeserialize(null);
                checkDeserialize(undefined);
                checkDeserialize(123);
                checkDeserialize('abc');
                checkDeserialize(true);
                checkDeserialize([]);
                checkDeserialize(function() {});
            });

            it('should return an error if the user token does not define a valid username', function() {
                function checkDeserialize(username) {
                    var deserializerComplete = _getCompletionSpy();
                    var userToken = {
                        username: username
                    };
                    _deserializer(userToken, deserializerComplete.spy);

                    expect(deserializerComplete.spy).to.have.been.calledOnce;
                    var deserializeError = deserializerComplete.spy.args[0][0];
                    expect(deserializeError).to.be.an.instanceof(InvalidSessionError);
                }

                checkDeserialize(null);
                checkDeserialize(undefined);
                checkDeserialize(123);
                checkDeserialize('');
                checkDeserialize(true);
                checkDeserialize([]);
                checkDeserialize(function() {});
            });

            it('should return an error if the user token does not define a valid timestamp', function() {
                function checkDeserialize(sessionTimestamp) {
                    var deserializerComplete = _getCompletionSpy();
                    var userToken = {
                        username: VALID_USERNAME,
                        sessionTimestamp: sessionTimestamp
                    };
                    _deserializer(userToken, deserializerComplete.spy);

                    expect(deserializerComplete.spy).to.have.been.calledOnce;
                    var deserializeError = deserializerComplete.spy.args[0][0];
                    expect(deserializeError).to.be.an.instanceof(InvalidSessionError);
                }

                checkDeserialize(null);
                checkDeserialize(undefined);
                checkDeserialize(0);
                checkDeserialize(-1);
                checkDeserialize('');
                checkDeserialize(true);
                checkDeserialize([]);
                checkDeserialize(function() {});
            });

            it('should return an error if the user token has an expired timestamp', function() {
                var deserializerComplete = _getCompletionSpy();
                var userToken = {
                    username: VALID_USERNAME,
                    sessionTimestamp: Date.now() - _sessionTimeout - 1
                };
                _deserializer(userToken, deserializerComplete.spy);

                expect(deserializerComplete.spy).to.have.been.calledOnce;
                var deserializeError = deserializerComplete.spy.args[0][0];
                expect(deserializeError).to.be.an.instanceof(InvalidSessionError);
            });

            it('should return an error if the user token has an invalid token version', function() {
                function checkDeserialize(sessionTokenVersion) {
                    var deserializerComplete = _getCompletionSpy();
                    var userToken = {
                        username: VALID_USERNAME,
                        sessionTimestamp: Date.now() + _sessionTimeout,
                        sessionTokenVersion: sessionTokenVersion
                    };
                    _deserializer(userToken, deserializerComplete.spy);

                    expect(deserializerComplete.spy).to.have.been.calledOnce;
                    var deserializeError = deserializerComplete.spy.args[0][0];
                    expect(deserializeError).to.be.an.instanceof(InvalidSessionError);
                }

                checkDeserialize(null);
                checkDeserialize(undefined);
                checkDeserialize(123);
                checkDeserialize('');
                checkDeserialize('abc');
                checkDeserialize(true);
                checkDeserialize([]);
                checkDeserialize(function() {});
            });

            it('should return an error if the username in the user token is invalid', function(done) {
                var deserializerComplete = _getCompletionSpy();
                var userToken = {
                    username: 'baduser',
                    sessionTimestamp: Date.now() + _sessionTimeout,
                    sessionTokenVersion: _sessionTokenVersion
                };

                function verifyRejection() {
                    var deserializeError = deserializerComplete.spy.args[0][0];
                    expect(deserializeError).to.be.an.instanceof(InvalidSessionError);
                }

                _deserializer(userToken, deserializerComplete.spy);
                expect(deserializerComplete.promise).to.be.fulfilled
                    .then(verifyRejection)
                    .then(_assertionHelper.getNotifySuccessHandler(done),
                        _assertionHelper.getNotifyFailureHandler(done));

            });

            it('should return a valid user object if the username in the user token is valid', function(done) {
                var deserializerComplete = _getCompletionSpy();
                var userToken = {
                    username: VALID_USERNAME,
                    sessionTimestamp: Date.now() + _sessionTimeout,
                    sessionTokenVersion: _sessionTokenVersion
                };

                function verifyUser() {
                    var deserializeError = deserializerComplete.spy.args[0][0];
                    var user = deserializerComplete.spy.args[0][1];

                    expect(deserializeError).to.be.null;
                    expect(user).to.be.an.instanceof(User);
                }

                _deserializer(userToken, deserializerComplete.spy);
                expect(deserializerComplete.promise).to.be.fulfilled
                    .then(verifyUser)
                    .then(_assertionHelper.getNotifySuccessHandler(done),
                        _assertionHelper.getNotifyFailureHandler(done));
            });

            it('should set the session timestamp from the user token on the user object', function(done) {
                var deserializerComplete = _getCompletionSpy();
                var userToken = {
                    username: VALID_USERNAME,
                    sessionTimestamp: Date.now() + _sessionTimeout,
                    sessionTokenVersion: _sessionTokenVersion
                };

                function verifyUser() {
                    var deserializeError = deserializerComplete.spy.args[0][0];
                    var user = deserializerComplete.spy.args[0][1];

                    expect(deserializeError).to.be.null;
                    expect(user).to.be.an.instanceof(User);
                    expect(user.sessionTimestamp).to.equal(userToken.sessionTimestamp);
                }

                _deserializer(userToken, deserializerComplete.spy);
                expect(deserializerComplete.promise).to.be.fulfilled
                    .then(verifyUser)
                    .then(_assertionHelper.getNotifySuccessHandler(done),
                        _assertionHelper.getNotifyFailureHandler(done));
            });

            it('should set all the service tokens from the user token on the user object', function(done) {
                var deserializerComplete = _getCompletionSpy();
                var userToken = {
                    username: VALID_USERNAME,
                    sessionTimestamp: Date.now() + _sessionTimeout,
                    sessionTokenVersion: _sessionTokenVersion,
                    serviceTokens: {
                        'service1': 'service1_token',
                        'service2': 'service2_token',
                        'service3': 'service3_token',
                        'service4': 'service4_token',
                    }
                };

                function verifyUser() {
                    var deserializeError = deserializerComplete.spy.args[0][0];
                    var user = deserializerComplete.spy.args[0][1];

                    expect(deserializeError).to.be.null;
                    expect(user).to.be.an.instanceof(User);
                    expect(user.sessionTimestamp).to.equal(userToken.sessionTimestamp);
                    expect(user._serviceTokens).to.deep.equal(userToken.serviceTokens);
                    expect(user._serviceTokens).to.not.equal(userToken.serviceTokens);
                }

                _deserializer(userToken, deserializerComplete.spy);
                expect(deserializerComplete.promise).to.be.fulfilled
                    .then(verifyUser)
                    .then(_assertionHelper.getNotifySuccessHandler(done),
                        _assertionHelper.getNotifyFailureHandler(done));
            });
        });

        describe('[username-password strategy]', function() {
            var _authenticator = null;

            beforeEach(function() {
                _auth.configure(_appHelper.getMockApp());
                _authenticator = _passportMock.use.args[0][1];
            });

            it('should fail authenticate requests if the username/password combination is invalid', function(done) {
                var errorMessage = 'Login error. Please check username/password.';
                var authComplete = _getCompletionSpy();

                function verifyAuthBehavior() {
                    expect(authComplete.spy).to.have.been.calledOnce;
                    expect(authComplete.spy).to.have.been.calledWith(null, null, errorMessage);
                }

                _authenticator('user', 'badpassword', authComplete.spy);

                expect(authComplete.promise).to.be.fulfilled
                    .then(verifyAuthBehavior)
                    .then(_assertionHelper.getNotifySuccessHandler(done),
                        _assertionHelper.getNotifyFailureHandler(done));
            });

            it('should fail authenticate requests if a user with the specified user name could not be initialized', function(done) {
                var authComplete = _getCompletionSpy();

                function verifyAuthBehavior() {
                    expect(authComplete.spy).to.have.been.calledOnce;
                    expect(authComplete.spy.args[0][0]).to.not.be.null;
                    expect(authComplete.spy.args[0][1]).to.be.null;
                }

                _authenticator('user', 'user', authComplete.spy);

                expect(authComplete.promise).to.be.fulfilled
                    .then(verifyAuthBehavior)
                    .then(_assertionHelper.getNotifySuccessHandler(done),
                        _assertionHelper.getNotifyFailureHandler(done));
            });

            it('should pass authenticate requests if the username/password combination is valid', function(done) {
                var authComplete = _getCompletionSpy();

                function verifyAuthBehavior() {
                    expect(authComplete.spy).to.have.been.calledOnce;
                    expect(authComplete.spy.args[0][0]).to.be.null;
                    var user = authComplete.spy.args[0][1];
                    expect(user).to.be.an.instanceof(User);
                }

                _authenticator(VALID_USERNAME, VALID_USERNAME, authComplete.spy);

                expect(authComplete.promise).to.be.fulfilled
                    .then(verifyAuthBehavior)
                    .then(_assertionHelper.getNotifySuccessHandler(done),
                        _assertionHelper.getNotifyFailureHandler(done));
            });
        });
    });

    describe('ensureUserSession()', function() {
        it('should do nothing if passport has not been initialized', function() {
            var req = _expressMocks.getMockReq();
            var res = null;
            var next = _sinon.spy();

            _auth.ensureUserSession(req, res, next);

            expect(req._passport).to.be.undefined;
            expect(next).to.have.been.calledOnce;
        });

        it('should do nothing if passport has been initialized, but session has not', function() {
            var req = _expressMocks.getMockReq();
            var res = null;
            var next = _sinon.spy();
            req._passport = {};

            _auth.ensureUserSession(req, res, next);

            expect(req._passport.session).to.be.undefined;
            expect(next).to.have.been.calledOnce;
        });

        it('should do nothing if passport, user and session have all been initialized', function() {
            var req = _expressMocks.getMockReq();
            var res = null;
            var next = _sinon.spy();
            var user = {};
            req._passport = {
                session: {
                    user: user
                }
            };

            _auth.ensureUserSession(req, res, next);

            expect(req._passport.session.user).to.equal(user);
            expect(next).to.have.been.calledOnce;
        });

        it('should do set the user property to 0 if passport and session have been defined, but user has not', function() {
            var req = _expressMocks.getMockReq();
            var res = null;
            var next = _sinon.spy();
            req._passport = {
                session: {}
            };

            _auth.ensureUserSession(req, res, next);

            expect(req._passport.session.user).to.equal(0);
            expect(next).to.have.been.calledOnce;
        });

    });
});
