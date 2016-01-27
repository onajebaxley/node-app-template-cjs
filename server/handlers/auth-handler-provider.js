/* jshint node:true */
'use strict';

var _logger = require('../logger');
var _util = require('util');
var _passport = require('passport');

/**
 * Class that defines request handlers for authentication specific routes
 * such as login, logout, etc.
 *
 * @class AuthHandlerProvider
 * @constructor
 * @param {String} defaultRedirectUrl The default path to redirect the user
 *          after successful login.
 */
function AuthHandlerProvider(defaultRedirectUrl) {
    if (typeof defaultRedirectUrl !== 'string' || defaultRedirectUrl.length <= 0) {
        throw new Error('Invalid redirect url specified (arg #1)');
    }
    this._logger = _logger.getLogger();
    this._defaultRedirectUrl = defaultRedirectUrl;
}

/**
 * @class AuthHandlerProvider
 * @method _getRedirectUrl
 * @private
 */
AuthHandlerProvider.prototype._getRedirectUrl = function(url) {
    if (typeof url !== 'string' || url.length <= 0) {
        return this._defaultRedirectUrl;
    }
    return url;
};

/**
 * Handles a request to show the login page to the user
 *
 * @class AuthHandlerProvider
 * @method loginPageHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
AuthHandlerProvider.prototype.loginPageHandler = function() {
    return function(req, res, next) {
        res.render('login', {
            redirect: this._getRedirectUrl(req.query.redirect)
        });
    }.bind(this);
};

/**
 * Handles a request to process a logout request from the user
 *
 * @class AuthHandlerProvider
 * @method logoutHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
AuthHandlerProvider.prototype.logoutHandler = function() {
    return function(req, res, next) {
        var user = req.user;

        if (user) {
            req.logOut();
            this._logger.info('User logged out: [%s]', user.username);
        } else {
            this._logger.warn('No logout performed. User not logged in');
        }

        var redirectUrl = this._getRedirectUrl(req.query.redirect);
        this._logger.info('Redirecting user to page: [%s]', redirectUrl);

        return res.redirect(redirectUrl);
    }.bind(this);
};

/**
 * Handles an authentication request from the user, by using
 * username/password strategy
 *
 * @class AuthHandlerProvider
 * @method authUsernamePasswordHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
AuthHandlerProvider.prototype.authUsernamePasswordHandler = function() {
    return function(req, res, next) {
        //NOTE: We need this function inside the handler so that the passport's
        //authentication callback handler gets access to the req, res and next
        //objects.
        var handler = _passport.authenticate('username-password', function(err, user, info) {
            if (err) {
                this._logger.error('Error authenticating user', err);
                next(err);
                return;
            }

            if (!user) {
                this._logger.error('Login failed: [%s]', req.body.username, info);
                res.render('login', {
                    username: req.body.username,
                    errorMessage: 'Invalid username and/or password'
                });
                return;
            }
            req.logIn(user, function(err) {
                if (err) {
                    this._logger.error('Error creating session: [%s]', user.username);
                    next(err);
                    return;
                }

                this._logger.info('Session created for user: [%s]', user.username);

                var redirectUrl = this._getRedirectUrl(req.body.redirect);
                this._logger.info('Redirecting user to page: [%s]', redirectUrl);

                res.redirect(redirectUrl);
            }.bind(this));
        }.bind(this));

        handler(req, res, next);
    }.bind(this);
};

module.exports = AuthHandlerProvider;
