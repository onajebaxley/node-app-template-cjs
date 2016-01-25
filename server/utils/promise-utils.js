/**
 * Module that exposes utility functions with promises/deferred objects.
 */

/* jshint node:true */
'use strict';


module.exports = {
    /**
     * Wraps an action with a try/catch bock, converting exceptions into rejected
     * promises.
     *
     * @class server.utils.promiseUtils
     * @method wrapWithExceptionHandler
     * @protected
     * @param {Function} action The action to wrap with a try/catch block
     * @param {Object} def The deferred object associated with the async option
     * @return {Function} A wrapper function that handles exceptions thrown during
     *          action execution.
     */
    wrapWithExceptionHandler: function(action, def) {
        if (typeof action !== 'function') {
            throw new Error('Invalid action function specified (arg #1)');
        }
        if (!def || typeof def !== 'object' || typeof def.reject !== 'function') {
            throw new Error('Invalid deferred object specified (arg #2)');
        }

        return function() {
            try {
                action();
            } catch (ex) {
                def.reject(ex);
            }
        };
    }
};
