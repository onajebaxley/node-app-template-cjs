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
     * Deletes a configuration key, or all configuration keys from the
     * GLOBAL object.
     *
     * @module test.utils.configHelper
     * @method deleteConfig
     * @param {String} [key] An optional key to delete. If omitted, all
     *          keys will be deleted.
     */
    deleteConfig: function(key) {
        if (!GLOBAL.config || typeof GLOBAL.config !== 'object') {
            return;
        }
        if (!_originalConfig) {
            _originalConfig = GLOBAL.config;
            GLOBAL.config = {};
        }
        var keys = (typeof key !== 'string' || key.length <= 0) ?
            Object.keys(GLOBAL.config) : [key];

        keys.forEach(function(key) {
            delete GLOBAL.config[key];
        });
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
