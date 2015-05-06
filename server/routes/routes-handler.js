/* jshint node:true */
'use strict';

/**
 * Base class for HTTP request handler objects. Provides some basic
 * initialization and utility methods that will be useful to classes that
 * implement HTTP request handlers.
 *
 * @class RoutesHandler
 * @constructor
 */
function RoutesHandler() {
    this._logger = GLOBAL.getLogger();
}

/**
 * Method that wraps an existing handler in a try/catch block to handle
 * exceptions thrown during synchronous execution.
 * 
 * @class RoutesHandler
 * @protected
 * @param {Function} handler The handler to wrap
 */
RoutesHandler.prototype._wrapHandler = function(handler) {
    if(typeof handler !== 'function') {
        throw new Error('Invalid callback specified (arg #1)');
    }

    return function(req, res, next) {
        try {
            handler(req, res, next);
        } catch (err) {
            this._logger.error(err.toString());
            res.status(500).send(err.toString());
        }
    }.bind(this);
};

module.exports = RoutesHandler;
