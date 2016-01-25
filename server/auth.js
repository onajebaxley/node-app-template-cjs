/**
 * Configures authentication strategies for the system. Multible authentication
 * strategies may be configured and accessed via passport js' api.
 */

/* jshint node:true */
'use strict';

var _util = require('util');
var _q = require('q');
var _clone = require('clone');
var _passport = require('passport');
var _passportLocal = require('passport-local');

var User = require('./lib/user');
var InvalidSessionError = require('./lib/invalid-session-error');
var _dataAccessFactory = require('./data-access-factory');
var _logger = require('./logger');
var _promiseUtils = require('./utils/promise-utils');
var _isInitialized = false;

function _authenticateUser(username, password) {
    var def = _q.defer();

    process.nextTick(_promiseUtils.wrapWithExceptionHandler(function() {
        if (username === password) {
            def.resolve(username);
        } else {
            def.reject('Invalid username/password');
        }
    }, def));

    return def.promise;
}

function _initUser(username) {
    var def = _q.defer();
    var initWrapper = _promiseUtils.wrapWithExceptionHandler(function() {
        var userProfileDao = _dataAccessFactory.getDataAccessObject('user-profile');
        userProfileDao.lookupUser(username).then(function(user) {
            if (!user) {
                def.reject('Could not find user with username: [%s]', username);
                return;
            }
            user.sessionTimestamp = Date.now();
            var roles = _clone(user.roles);

            delete user.username;
            delete user.roles;
            def.resolve(new User(username, roles, user));
        });
    }, def);

    //Invoke the wrapper.
    initWrapper();

    return def.promise;
}

function _usernamePasswordStrategy(username, password, authComplete) {
    var logger = _logger.getLogger();
    logger.debug('Authenticating user against local username/password store: [%s]', username);

    _authenticateUser(username, password).then(function(username) {
        logger.info('User successfully authenticated. Initializing user object: [%s]', username);
        return _initUser(username).then(function(user) {
            logger.info('User successfully initialized: [%s]', username);
            authComplete(null, user);
        }, function(error) {
            logger.error('Error initializing user: [%s]', username, error);
            authComplete(error, null);
        });
    }, function(error) {
        logger.error('Error authenticating user: [%s]', username, error);
        authComplete(null, null, 'Login error. Please check username/password.');
    }).done();
}

// Converts a user object into a token that can be serialized (into a
// cookie, for example).
function _userSerializer(user, done) {
    var logger = _logger.getLogger();
    logger.debug('Serializing user', user);

    var userToken = {};
    if (user && typeof user === 'object' &&
        typeof user.username === 'string' && user.username.length > 0 &&
        typeof user.sessionTimestamp === 'number' && user.sessionTimestamp > 0) {


        userToken.username = user.username;
        userToken.serviceTokens = _clone(user._serviceTokens);
        userToken.sessionTokenVersion = GLOBAL.config.cfg_session_token_version;
        userToken.sessionTimestamp = user.sessionTimestamp;
    }

    done(null, userToken);
}

function _userDeserializer(userToken, done) {
    var logger = _logger.getLogger();
    logger.verbose('Deserializing user token.', userToken);

    if (!userToken || typeof userToken !== 'object' ||
        typeof userToken.username !== 'string' ||
        userToken.username.length <= 0 ||
        typeof userToken.sessionTimestamp !== 'number') {

        // Bad user token
        logger.warn('Invalid session token received', userToken);
        done(new InvalidSessionError('User session is not valid'), null);

    } else if (Date.now() - userToken.sessionTimestamp > GLOBAL.config.cfg_session_timeout) {
        // Session has expired.
        logger.warn('User session has expired: [%s]', userToken.username);
        done(new InvalidSessionError('User session is no longer valid'), null);

    } else if (userToken.sessionTokenVersion !== GLOBAL.config.cfg_session_token_version) {
        // User is logging in with a different session token version.
        logger.error('User session token had invalid version number: [%s]. Token version: [%s]',
            userToken.username, userToken.sessionTokenVersion);
        done(new InvalidSessionError('User session is no longer valid'), null);

    } else {
        _initUser(userToken.username).then(function(user) {
            logger.info('Successfully looked up user from session: [%s]', userToken.username);
            user.sessionTimestamp = userToken.sessionTimestamp;
            for (var serviceName in userToken.serviceTokens) {
                logger.debug('Setting service token: [%s]', serviceName);
                user.setServiceToken(serviceName, userToken.serviceTokens[serviceName]);
            }
            done(null, user);
        }, function(error) {
            var errorMessage = _util.format('Unable to locate user with username: [%s]', userToken.username);
            logger.error(errorMessage, error);
            done(new InvalidSessionError(errorMessage), null);
        });
    }
}

module.exports = {
    /**
     * Configures authentication strategies for the application. This method
     * may configure multiple strategies, allowing the app to support multiple
     * authentication schemes.
     *
     * @module server.auth
     * @method configure
     * @param {Object} app  A reference to the express App object.
     */
    configure: function(app) {
        if (!app || app instanceof Array || typeof app !== 'function') {
            throw new Error('Invalid app object specified (arg #1)');
        }
        if (_isInitialized) {
            // Already initialized. Do nothing.
            return;
        }
        var logger = _logger.getLogger();

        //TODO: This strategy should be replaced with a more meaningful real world
        //implementation.
        _passport.use('username-password', _usernamePasswordStrategy);
        _passport.serializeUser(_userSerializer);
        _passport.deserializeUser(_userDeserializer);

        _isInitialized = true;
    },

    /**
     * Handler that initializes the user object in the session, if one does not exist.
     * This is required to ensure proper functioning of passport's session strategy
     * (which appears to allow requests through when a session does not contain a user
     * object)
     *
     * This method is an expressjs compatible handler method.
     *
     * @module auth
     * @method ensureUserSession
     * @param {Object} req The HTTP request object
     * @param {Object} res The HTTP response object
     * @param {Object} next A method that invokes the next handler in the chain
     */
    ensureUserSession: function(req, rep, next) {
        if (req._passport && req._passport.session &&
            !req._passport.session.user) {
            req._passport.session.user = 0;
        }
        next();
    }
};
