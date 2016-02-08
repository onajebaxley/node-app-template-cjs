/**
 * Defines configuration settings for the server. The module returns a hash,
 * with one key for every environment that is supported. The value of each
 * key is a function that will be invoked to configure the app.
 */

/* jshint node:true */
'use strict';

var _packageInfo = require('../package.json');
var _path = require('path');
var _rc = require('rc');

var _isInitialized = false;

// Global config object to store application level config.
GLOBAL.config = {};

function _setConfig(key, value, app) {
    GLOBAL.config[key] = value;
    if (app) {
        app.set(key, value);
    }
}

var _configOverrides = {

    /**
     * Special settings that are applied when the application is run in
     * development mode.
     *
     * @param {Object} app  A reference to the express App object.
     */
    development: function(app) {
        var appVersion = GLOBAL.config.cfg_app_version;
        _setConfig('cfg_app_version', appVersion + '__' + (new Date()).getTime());
        _setConfig('cfg_static_file_cache_duration', 0);
        _setConfig('cfg_enable_dyamic_js_compile', true);
        _setConfig('cfg_enable_dyamic_css_compile', true);
        _setConfig('cfg_enable_minified_files', false);
        _setConfig('cfg_session_secure_proxy', false);
        _setConfig('cfg_session_timeout', 900 * 1000); // 15 minutes
    },

    /**
     * Special settings that are applied when the application is run in
     * test mode.
     *
     * @param {Object} app  A reference to the express App object.
     */
    test: function(app) {
        var appVersion = GLOBAL.config.cfg_app_version;
        _setConfig('cfg_app_version', appVersion + '__' + (new Date()).getTime());
        _setConfig('cfg_static_file_cache_duration', 0);
    },

    /**
     * Special settings that are applied when the application is run in
     * production mode.
     *
     * @param {Object} app  A reference to the express App object.
     */
    production: function(app) {}
};

function _getApplicationConfig(appName) {
    // Read configuration settings from the rc file, and set defaults
    // when no settings are available in the file.
    // Note that when set via environment variables, boolean values are
    // treated as strings, and must be truthy (non empty) or falsy (empty)
    // to have the desired effect.
    appName = appName.replace(/-/g, '_');
    return _rc(appName, {
        title: 'Template App',
        port: 3000,
        rootPath: '/',
        proxyPresent: false,
        sessionSecret: 'secret',
        sessionSecureProxy: true,
        sessionCookieName: appName + '_session',
        sessionTimeout: 10800000, // 3 hours
        sessionTokenVersion: 1,
        logsDir: 'log',
        staticFileCacheDuration: 31558464000 // One year
    });
}

function _stringToBoolean(value) {
    return (typeof value === 'string') ? (value.toLowerCase() === 'true') : !!value;
}

module.exports = {

    /**
     * Applies configuration parameters to the application. Some basic
     * configuration is applied, and additionally, if applicable, some
     * environment specific settings are also applied.
     *
     * It is strongly recommended that this module be used to set all
     * application configuration values.
     *
     * @module server.config
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

        // Read package info and application configuration settings.
        var appConfig = _getApplicationConfig(_packageInfo.name);
        var staticDir = _path.join(__dirname, '../client');
        var env = app.get('env');

        // Common application configuration (also updates express settings)
        _setConfig('views', _path.join(__dirname, 'views'), app);
        _setConfig('view engine', 'jade', app);

        // Other, configuration settings, not updating express.
        _setConfig('cfg_env', env);
        _setConfig('cfg_app_name', _packageInfo.name);
        _setConfig('cfg_app_version', _packageInfo.version);
        _setConfig('cfg_app_title', appConfig.title );

        _setConfig('cfg_port', appConfig.port);
        _setConfig('cfg_root_path', appConfig.rootPath);

        _setConfig('cfg_static_dir', staticDir);
        _setConfig('cfg_static_file_cache_duration', appConfig.staticFileCacheDuration);

        _setConfig('cfg_logs_dir', appConfig.logsDir);
        _setConfig('cfg_proxy_present', _stringToBoolean(appConfig.proxyPresent));

        _setConfig('cfg_session_secret', appConfig.sessionSecret);
        _setConfig('cfg_session_secure_proxy', _stringToBoolean(appConfig.sessionSecureProxy));
        _setConfig('cfg_session_cookie_name', appConfig.sessionCookieName);
        _setConfig('cfg_session_timeout', appConfig.sessionTimeout);
        _setConfig('cfg_session_token_version', appConfig.sessionTokenVersion);

        _setConfig('cfg_enable_dyamic_js_compile', false);
        _setConfig('cfg_enable_dyamic_css_compile', false);
        _setConfig('cfg_enable_minified_files', true);

        // Apply configuration overrides if any have been defined for the
        // environment.
        var applyConfigOverrides = _configOverrides[env];
        if (!applyConfigOverrides) {
            console.info('no config overrides found for environment [' + env + ']');
        } else {
            applyConfigOverrides(app);
        }

        var rootPath = GLOBAL.config.cfg_root_path;
        var proxyPresent = GLOBAL.config.cfg_proxy_present;
        var mountPath = proxyPresent ? '/' : rootPath;

        _setConfig('cfg_mount_path', mountPath);

        // Configuration object that can be injected into the client.
        app.locals.gv_config = {
            app_name: GLOBAL.config.cfg_app_name,
            app_title: GLOBAL.config.cfg_app_title,
            app_version: GLOBAL.config.cfg_app_version,
            root_path: GLOBAL.config.cfg_root_path
            // Additional configuration can go here:
        };

        _isInitialized = true;
    }
}
