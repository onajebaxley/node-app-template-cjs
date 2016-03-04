/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _appHelper = require('./app-helper');
var _configHelper = require('./config-helper');
var _rewire = require('rewire');

/**
 * Test helper for the logger module
 *
 * @module test.serverUtils.loggerHelper
 */
module.exports = {

    /**
     * Initializes the actual logger module with dummy parameters.
     *
     * @module test.serverUtils.loggerHelper
     * @method initLogger
     * @param {Boolean} [configure=false] If set to true, automatically
     *          configures the logger with an empty app.
     * @return {Object} Reference to the logger object
     */
    initLogger: function(configure) {
        configure = !!configure;

        _configHelper.setConfig('cfg_logs_dir', 'log');
        var logger = _rewire('../../server/logger');
        logger.__set__('_winston', module.exports.getWinstonMock());

        if (configure) {
            logger.configure(_appHelper.getMockApp());
        }

        return logger;
    },

    /**
     * Initializes a mock winston logger module.
     *
     * @module test.serverUtils.loggerHelper
     * @method getWinstonMock
     * @return {Object} A mock logger module that can be injected into other
     *          modules.
     */
    getWinstonMock: function() {
        var mockLogger = {
            loggers: {
                add: _sinon.spy(),
                get: _sinon.stub().returns({
                    silly: _sinon.spy(),
                    debug: _sinon.spy(),
                    verbose: _sinon.spy(),
                    info: _sinon.spy(),
                    warn: _sinon.spy(),
                    error: _sinon.spy(),
                    log: _sinon.spy()
                })
            },
            transports: {
                Console: _sinon.spy()
            }
        };

        return mockLogger;
    }
};
