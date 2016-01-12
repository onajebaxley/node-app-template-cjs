/**
 * Configures and provides session handler objects. The handler is not attached
 * to any particular path - that is left to the route configuration module.
 */

/* jshint node:true */
'use strict';

var _cookieSession = require('cookie-session');
var _clone = require('clone');

var _sessionOptions = null;
var _sessionHandlerMap = null;
var _isInitialized = false;

module.exports = {
    /**
     * Configures the session provider object for the application. Once
     * configured, the session provider can be used to generate multiple
     * session handlers.
     *
     * @module server.session
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
        _sessionHandlerMap = { };
        _sessionOptions = {
            name: GLOBAL.config.cfg_session_cookie_name,
            secret: GLOBAL.config.cfg_session_secret,
            secureProxy: GLOBAL.config.cfg_session_secure_proxy,
            httpOnly: true,
            signed: true
        };

        _isInitialized = true;
    },

    /**
     * Creates a new session handler object for the given path, or returns a
     * previously configured session object for the path if one exists.
     *
     * @module server.session
     * @method getSessionHandler
     * @param {String} [path] An optional parameter that restricts the paths for
     *          which the session is applicable.
     * @return {Object} A reference to the session handler object
     */
    getSessionHandler: function(path) {
        if(typeof path !== 'string' || path.length <= 0) {
            path = '/';
        }
        var handler = _sessionHandlerMap[path];
        if(!handler) {
            var options = _clone(_sessionOptions);
            options.path = path;
            handler = _cookieSession(options);

            _sessionHandlerMap[path] = handler;
        }

        return handler;
    }
};
