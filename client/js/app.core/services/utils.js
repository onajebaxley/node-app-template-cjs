'use strict';

/**
 * Returns a service that contains utility methods that can be used by other
 * components.
 */
module.exports = [ function() {
    return {
        /**
         * Returns the default value if the input value is falsy, and the input
         * value if it is truthy.
         *
         * @module app.core.utils
         * @method applyDefault
         * @param {Object/String/Number} value The value to check for
         *          falsiness/truthiness
         * @param {Object/String/Number} defaultValue The default value to use
         *          if the input value is falsy.
         */
        applyDefault: function(value, defaultValue) {
            return (value)? value: defaultValue;
        },

        /**
         * Returns the default value if the input value is not a string, or is
         * empty. Check for empty string can be excluded if necessary.
         *
         * @module app.core.utils
         * @method applyDefaultIfNotString
         * @param {Object/String/Number} value The value to check for
         *          falsiness/truthiness
         * @param {String} defaultValue The default value to use
         *          if the input value is falsy.
         * @param {Boolean} [canBeFalsy=false] If set to true, omits
         *          test for falsy value.
         */
        applyDefaultIfNotString: function(value, defaultValue, canBeFalsy) {
            if(typeof value !== 'string' || (value.length <= 0 && !canBeFalsy)) {
                return defaultValue;
            } else {
                return value;
            }
        },

        /**
         * Returns the default value if the input value is not a string, or is
         * empty. Check for empty string can be excluded if necessary.
         *
         * @module app.core.utils
         * @method applyDefaultIfNotString
         * @param {Object/String/Number} value The value to check for
         *          falsiness/truthiness
         * @param {String} defaultValue The default value to use
         *          if the input value is falsy.
         * @param {Boolean} [canBeFalsy=false] If set to true, omits
         *          test for falsy value.
         */
        applyDefaultIfNotNumber: function(value, defaultValue, canBeFalsy) {
            if(typeof value !== 'number' || (!value && !canBeFalsy)) {
                return defaultValue;
            } else {
                return value;
            }
        },

        /**
         * Returns the default value if the input value is not an object.
         *
         * @module app.core.utils
         * @method applyDefaultIfNotString
         * @param {Object/String/Number} value The value to check for
         *          falsiness/truthiness
         * @param {String} defaultValue The default value to use
         *          if the input value is falsy.
         */
        applyDefaultIfNotObject: function(value, defaultValue) {
            if(!value || value instanceof Array || typeof value !== 'object') {
                return defaultValue;
            } else {
                return value;
            }
        },

        /**
         * Returns the default value if the input value is not an array.
         * @module app.core.utils
         * @method applyDefaultIfNotString
         * @param {Object/String/Number} value The value to check for
         *          falsiness/truthiness
         * @param {String} defaultValue The default value to use
         *          if the input value is falsy.
         */
        applyDefaultIfNotArray: function(value, defaultValue) {
            if(!(value instanceof Array)) {
                return defaultValue;
            } else {
                return value;
            }
        }
    };
} ];
