/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _logger = require('../../server/logger');

var _originalConfig = null;

/**
 * Module of utility methods useful for testing.
 *
 * @module test.utils
 */
module.exports = {

    /**
     * Mock initializes the logger module.
     *
     * @module test.utils
     * @method initLogger
     */
    initLogger: function() {
        module.exports.mockConfig('cfg_logs_dir', 'log');
        _logger.configure(function() {});
    },

    /**
     * Creates and returns a mock logger object.
     *
     * @module test.utils
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
    },

    /**
     * Injects mock configuration information into the GLOBAL object
     *
     * @module test.utils
     * @method mockConfig
     * @param {String} key The configuration parameter key
     * @param {Object} value The value of the configuration parameter
     */
    mockConfig: function(key, value) {
        if (!_originalConfig) {
            _originalConfig = GLOBAL.config;
            GLOBAL.config = {};
        }
        GLOBAL.config[key] = value;
    },

    /**
     * Restores the original config information if it has been previously
     * overridden.
     *
     * @module test.utils
     * @method restoreConfig
     */
    restoreConfig: function() {
        if (_originalConfig) {
            GLOBAL.config = _originalConfig;
            _originalConfig = null
        }
    }
};
