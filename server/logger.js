/**
 * Configures loggers for the system. Multiple loggers may be configured and
 * accessed via an access method.
 */

/* jshint node:true */
'use strict';

var _winston = require('winston');
var _path = require('path');
var _winstonDailyRotateFile = require('winston-daily-rotate-file');

var _isInitialized = false;

module.exports = {
    /**
     * Configures loggers for the application. This method may configure
     * multiple loggers, intended for different purposes.
     *
     * @module server.logger
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

        // Logger for application logs.
        _winston.loggers.add('app', {
            transports: [
                new _winston.transports.Console({
                    level: 'silly',
                    colorize: true,
                    prettyPrint: true,
                    stringify: true,
                    label: 'app'
                }),

                new _winstonDailyRotateFile({
                    level: 'debug',
                    filename: _path.join(GLOBAL.config.cfg_logs_dir, 'app'),
                    datePattern: '.yyyy-MM-dd.log',
                    label: 'app'
                })
            ]
        });

        // Logger for access logs
        _winston.loggers.add('access', {
            transports: [
                new _winstonDailyRotateFile({
                    level: 'debug',
                    filename: _path.join(GLOBAL.config.cfg_logs_dir, 'access'),
                    datePattern: '.yyyy-MM-dd.log',
                    json: false,
                    colorize: false
                })
            ]
        });

        _isInitialized = true;
    },

    /**
     * Allows access to previously configured loggers.
     *
     * @module server.logger
     * @method getLogger
     * @param {String} [name=app] An optional name of the logger to access.
     * @return {Object} A reference to the requested logger object.
     */
    getLogger: function(name) {
        if (!_isInitialized) {
            throw new Error('Cannot get logger. Logger has not been initialized');
        }
        if (typeof name === 'string' && name !== 'app' && name !== 'access') {
            throw new Error('Unsupported logger specified: ' + name);
        }
        name = name || 'app';
        return _winston.loggers.get(name);
    }
};
