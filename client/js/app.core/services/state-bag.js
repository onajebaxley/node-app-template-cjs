/**
 * Returns a client side state management object that can be used by the client
 * to persist values across state transitions.
 */
'use strict';

var _clone = require('clone');

module.exports = [ 'localStorageService', function(localStorage) {
    var _state = {};

    function _restoreLocalStorageSettings() {
        if(!localStorage.isSupported) {
            return;
        }

        function _default(value, defaultValue) {
            if(typeof value === 'undefined') {
                return defaultValue;
            } else if(value instanceof Array) {
                return _clone(value);
            }
            return value;
        }

        function _applySetting(propPrefix, container) {
            for(var propName in container) {
                var storageKey = propPrefix + '.' + propName;

                var value = container[propName];
                if(!(value instanceof Array) &&
                   value && typeof value === 'object') {
                    _applySetting(storageKey, value);
                } else {
                    container[propName] = _default(localStorage.get(storageKey),
                                                  container[propName]);
                }
            }
        }

        _applySetting('_state', _state);
    }

    _restoreLocalStorageSettings();

    return {
        /**
         * Sets a key-value pair in the state bag.
         *
         * @module app.core.stateBag
         * @method set
         * @param {String} key The key of the state object
         * @param {Object} value The value of the state object
         */
        set: function(key, value) {
            if(typeof key !== 'string' || key.length <= 0) {
                throw new Error('Invalid key specified (arg #1)');
            }
            _state[key] = _clone(value);
        },

        /**
         * Gets a previously set value.         *
         *
         * @module app.core.stateBag
         * @method get
         * @param {String} key The key of the state object
         * @param {Object/String/Number} [defaultValue] The default value to
         *          return if the state value is not defined.
         * @return {Object/String/Number} The value of the state bag
         *          parameter, or the default value if the parameter is
         *          undefined.
         */
        get: function(key, defaultValue) {
            var value = _state[key];
            return (typeof value !== 'undefined') ? value: defaultValue;
        }
    };
} ];
