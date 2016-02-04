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
        }
    };
} ];
