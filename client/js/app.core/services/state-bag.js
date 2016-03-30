/**
 * Returns a client side state management object that can be used by the client
 * to persist values across state transitions.
 */
'use strict';

var _clone = require('clone');

module.exports = [ 'localStorageService', function(localStorage) {
    var STATE_PREFIX = '_state.';
    var _state = {};

    if(localStorage.isSupported) {
        var keys = localStorage.keys();
        for(var index = 0; index < keys.length; index++) {
            var prop = keys[index];
            if(prop.indexOf(STATE_PREFIX) === 0) {
                var stateKey = prop.replace(STATE_PREFIX, '');
                _state[stateKey] = _clone(localStorage.get(prop));
            }
        }
    }

    return {
        /**
         * Sets a key-value pair in the state bag.
         *
         * @module app.core.stateBag
         * @method set
         * @param {String} key The key of the state object
         * @param {Object} value The value of the state object
         * @param {Boolean} [persist=false] If set to true, persists the value
         *          in local storage.
         */
        set: function(key, value, persist) {
            persist = !!persist;
            if(typeof key !== 'string' || key.length <= 0) {
                throw new Error('Invalid key specified (arg #1)');
            }
            _state[key] = _clone(value);
            if(localStorage.isSupported && persist) {
                localStorage.set(STATE_PREFIX + key, value);
            }
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
            var value = _clone(_state[key]);
            return (typeof value !== 'undefined') ? value: defaultValue;
        }
    };
} ];
