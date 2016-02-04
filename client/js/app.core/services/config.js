'use strict';

var _clone = require('clone');

/**
 * Returns a client side configuration object that can be used by the client to
 * retrieve config parametres set by the server. Configuration parameters can
 * be initialized by the server dynamically by injecting script snippets into
 * the web page served to the client.
 */
module.exports = [ function() {
    var _properties = {};

    /**
     * Sets a key-value pair in the client config object.
     *
     * @module app.core.configProvider
     * @method set
     * @param {String} key The key of the configuration setting
     * @param {Object} value The value of the configuration setting
     */
    this.set = function(key, value) {
        if(typeof key !== 'string' || key.length <= 0) {
            throw new Error('Invalid key specified (arg #1)');
        }
        _properties[key] = _clone(value);
    }

    this.$get = [ function() {
        return {
            /**
             * Gets a value from a previously set value.
             *
             * @module app.core.config
             * @method get
             * @param {String} key The key of the configuration setting
             * @param {Object/String/Number} defaultValue The default value to
             *          return if the configuration setting is not defined.
             * @return {Object/String/Number} The value of the configuration
             *          setting, or the default value if the setting is
             *          undefined.
             */
            get: function(key, defaultValue) {
                var value = _properties[key];
                return (typeof value !== 'undefined') ? value: defaultValue;
            }
        };
    } ];
} ];
