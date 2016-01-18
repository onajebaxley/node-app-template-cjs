/**
 * Defines all the routes supported by the server. For the sake of managability,
 * it is recommended that routes be defined in individual modules that are in
 * turn loaded and used by this module.
 */

/* jshint node:true */
'use strict';
var _path = require('path');
var _express = require('express');
var _favicon = require('serve-favicon');
var _morgan = require('morgan');
var _nodeSassMiddleware = require('node-sass-middleware');
var _browserifyMiddleware = require('browserify-middleware');

var _logger = require('./logger');
var _publicRoutes = require('./routes/public-routes');
var _isInitialized = false;

function _initAccessLogger() {
    var accessLogger = _logger.getLogger('access');
    var winstonStream = {
        write: function(message, encoding) {
            // We're piping from Morgan to Winston. There will be an extra
            // newline character that has to be trimmed.
            accessLogger.info(message.slice(0, -1));
        }
    };

    return _morgan('common', {
        stream: winstonStream
    });
}

function _initDynamicCssMiddleware() {
    // Dynamically generates css files from sass files. Intended for use in
    // development mode only. Production deployments should pre compile sass 
    // to css prior to deployment.
    return _nodeSassMiddleware({
        src: GLOBAL.config.cfg_static_dir,
        prefix: GLOBAL.config.cfg_root_path,
        debug: true,
        response: true,
        outputStyle: 'nested'
    });
}

function _initDynamicJsMiddleware() {
    var sourcePath = _path.join(GLOBAL.config.cfg_static_dir, '/js/app.js');

    // Dynamically generates a bundled javascript file from individual source
    // javascript files. Intended for development use only. Production
    // deployments should browserify the source modules prior to deployment.
    return _browserifyMiddleware(sourcePath);
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

        app.use(_initAccessLogger());

        if (GLOBAL.config.cfg_enable_dyamic_css_compile) {
            app.use(_initDynamicCssMiddleware());
        }

        if (GLOBAL.config.cfg_enable_dyamic_js_compile) {
            var bundlePath = _path.join(GLOBAL.config.cfg_mount_path, '/js/app.js');
            app.use(bundlePath, _initDynamicJsMiddleware());
        }

        app.use(_favicon(_path.join(GLOBAL.config.cfg_static_dir, 'img/favicon.ico')));

        _isInitialized = true;
    }
};
