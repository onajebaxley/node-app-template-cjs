/* jshint node:true, expr:true */
'use strict';

var _originalConfig = null;

/**
 * Test helper for the config module
 *
 * @module test.utils.configHelper
 */
module.exports = {
    /**
     * Injects mock configuration information into the GLOBAL object
     *
     * @module test.utils.configHelper
     * @method setConfig
     * @param {String} key The configuration parameter key
     * @param {Object} value The value of the configuration parameter
     */
    setConfig: function(key, value) {
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
     * @module test.utils.configHelper
     * @method restoreConfig
     */
    restoreConfig: function() {
        if (_originalConfig) {
            GLOBAL.config = _originalConfig;
            _originalConfig = null
        }
    }
};
