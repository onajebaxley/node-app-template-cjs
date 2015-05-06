/**
 * Defines all the routes supported by the server. For the sake of
 * managability, it is recommended that routes be defined in individual
 * modules that are in turn loaded and used by this module.
 */

/* jshint node:true */
'use strict';
var _path = require('path');
var _express = require('express');
var _favicon = require('serve-favicon');
var _morgan = require('morgan');

var _publicRoutes = require('./routes/public-routes');

module.exports = {

    /**
     * Attaches route handlers to the web application. The handlers may be
     * defined within this module, or may be defined in other modules, and
     * just attached to specific routes within this one.
     *
     * @param {Object} app  A reference to the express App object.
     */
    apply: function(app) {
        var enableDynamicCss = GLOBAL.config.cfg_enable_dyamic_css_compile;
        var enableDynamicJs = GLOBAL.config.cfg_enable_dyamic_js_compile;
        var staticDir = GLOBAL.config.cfg_static_dir;
        var rootPath = GLOBAL.config.cfg_root_path;
        var mountPath = GLOBAL.config.cfg_mount_path;
        var staticFileCacheDuration = GLOBAL.config.cfg_static_file_cache_duration;

        var accessLogger = GLOBAL.getLogger('access');
        var winstonStream = {
            write: function(message, encoding) {
                // We're piping from Morgan to Winston. There will be an extra
                // newline character that has to be trimmed.
                accessLogger.info(message.slice(0, -1));
            }
        };
        app.use(_morgan('common', {
            stream: winstonStream
        }));

        // Conditional middlewares.
        // When injected, dynamically generates css files from sass files.
        // Intended for use in development mode only. Production
        // deployments must pre compile sass --> css prior to deployment.
        if (enableDynamicCss) {
            var sassMiddleware = require('node-sass-middleware');
            app.use(sassMiddleware({
                src: staticDir,
                prefix: rootPath,
                debug: true,
                response: true,
                outputStyle: 'nested'
            }));
        }

        if (enableDynamicJs) {
            var jsMiddleware = require('browserify-middleware');
            var bundlePath = _path.join(mountPath, '/js/app.js');
            var sourcePath = _path.join(staticDir, '/js/app.js');

            app.use(bundlePath, jsMiddleware(sourcePath));
        }

        function forPath(path) {
            path = path || '';
            path = _path.join(mountPath, path);

            var mounter = {
                addHandler: function(handler) {
                    app.use(path, handler);
                    return mounter;
                }
            };
            return mounter;
        }

        // Handle requests for favicon.ico
        app.use(_favicon(_path.join(staticDir, 'img/favicon.ico')));

        // Mount the routers at the specified base paths.
        forPath('/')
            .addHandler(_express.static(staticDir))
            .addHandler(_publicRoutes.createRouter());
    }
};
