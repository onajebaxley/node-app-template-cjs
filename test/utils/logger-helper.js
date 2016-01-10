/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _logger = require('../../server/logger');
var _configHelper = require('./config-helper');

/**
 * Test helper for the logger module
 *
 * @module test.utils.loggerHelper
 */
module.exports = {

    /**
     * Mock initializes the logger module.
     *
     * @module test.utils.loggerHelper
     * @method initLogger
     */
    initLogger: function() {
        _configHelper.setConfig('cfg_logs_dir', 'log');
        _logger.configure(function() {});
    },

    /**
     * Creates and returns a mock logger object.
     *
     * @module test.utils.loggerHelper
     * @method getMockLogger
     * @return {Object} A mock logger object with spies for each logging method
     */
    getMockLogger: function() {
        return {
            getLogger: _sinon.stub().returns({
                silly: _sinon.spy(),
                debug: _sinon.spy(),
                verbose: _sinon.spy(),
                info: _sinon.spy(),
                warn: _sinon.spy(),
                error: _sinon.spy(),
                log: _sinon.spy()
            })
        };
    }
};
