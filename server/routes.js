/**
 * Defines all the routes supported by the server. For the sake of managability,
 * it is recommended that routes be defined in individual modules that are in
 * turn loaded and used by this module.
 */

/* jshint node:true */
'use strict';
var _path = require('path');
var _express = require('express');

var _logger = require('./logger');
var CoreHandlerProvider = require('./handlers/core-handler-provider');
var _publicRouter = require('./routers/public-router');
var _authRouter = require('./routers/auth-router');
var _appRouter = require('./routers/app-router');

var _isInitialized = false;
var ALL = null;

function _getMounterBuilder(app) {
    return function(path) {
        var attachHandler = app.use;
        if(typeof path === 'string' && path.length > 0) {
            path = _path.join(GLOBAL.config.cfg_mount_path, path);
            attachHandler = attachHandler.bind(app, path);
        } else {
            attachHandler = attachHandler.bind(app);
        }

        var mounter = {
            addHandler: function(handler) {
                attachHandler(handler);
                return mounter;
            }
        };
        return mounter;
    }
}


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

        var forPath = _getMounterBuilder(app);
        var provider = new CoreHandlerProvider(GLOBAL.config.cfg_static_dir,
                                               GLOBAL.config.cfg_root_path);
        var dynamicCssEnabled = GLOBAL.config.cfg_enable_dyamic_css_compile;
        var dynamicJsEnabled = GLOBAL.config.cfg_enable_dyamic_js_compile;

        // --------------------------------------------------------------------
        // Common middleware
        // --------------------------------------------------------------------

        //Access logger
        forPath(ALL).addHandler(provider.accessLoggerMiddleware());

        //Dynamic SASS -> CSS compilation (dev only)
        if(dynamicCssEnabled) {
            forPath(ALL).addHandler(provider.dynamicCssCompileMiddleware());
        }

        //Dynamic browserify compilation (dev only)
        if(dynamicJsEnabled) {
            var jsPath = '/js/app.js';
            var jsMiddleware = provider.dynamicJsCompileMiddleware(jsPath);

            forPath(jsPath).addHandler(jsMiddleware);
        }

        //Favicon.ico handler
        forPath(ALL).addHandler(provider.faviconHandler('img/favicon.ico'));

        // --------------------------------------------------------------------
        // Routers to handle application paths
        // --------------------------------------------------------------------
        forPath('/')
            .addHandler(_express.static(GLOBAL.config.cfg_static_dir))
            .addHandler(_publicRouter.createRouter());

        forPath('/auth')
            .addHandler(_authRouter.createRouter());

        forPath('/app')
            .addHandler(_appRouter.createRouter());

        // --------------------------------------------------------------------
        // Error handlers
        // --------------------------------------------------------------------
        //Handler for authentication errors
        forPath(ALL).addHandler(provider.authenticationErrorHandler());
        
        //Handler for 404 errors
        forPath(ALL).addHandler(provider.resourceNotFoundErrorHandler());

        //Catch all handler for all errors.
        forPath(ALL).addHandler(provider.catchAllErrorHandler());

        _isInitialized = true;
    }
};
