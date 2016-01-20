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

var _isInitialized = false;


function forPath(path) {
    path = path || '';
    path = _path.join(GLOBAL.config.cfg_mount_path, path);

    var mounter = {
        addHandler: function(handler) {
            app.use(path, handler);
            return mounter;
        }
    };
    return mounter;
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

        var provider = new CoreHandlerProvider(GLOBAL.config.cfg_static_dir,
                                               GLOBAL.config.cfg_root_path);

        //Access logger
        app.use(provider.accessLoggerMiddleware());

        //Dynamic SASS -> CSS compilation (dev only)
        if (GLOBAL.config.cfg_enable_dyamic_css_compile) {
            app.use(provider.dynamicCssCompileMiddleware());
        }
        //Dynamic browserify compilation (dev only)
        if (GLOBAL.config.cfg_enable_dyamic_js_compile) {
            var jsMountPath = _path.join(GLOBAL.config.cfg_mount_path, '/js/app.js');
            app.use(jsMountPath, provider.dynamicJsCompileMiddleware('/js/app.js'));
        }

        //Favicon.ico handler
        app.use(provider.faviconHandler('img/favicon.ico'));

        //Routers to handle application paths


        //Handler for authentication errors
        app.use(provider.authenticationErrorHandler());
        
        //Handler for 404 errors
        app.use(provider.resourceNotFoundErrorHandler());

        //Catch all handler for all errors.
        app.use(provider.catchAllErrorHandler());

        _isInitialized = true;
    }
};
