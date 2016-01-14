/* jshint node:true */
'use strict';

var _util = require('util');

/**
 * Error object that represents errors that occur due to invalid user sessions.
 *
 * @class InvalidSessionError
 * @constructor
 * @param {String} message The message associated with the error
 */
function InvalidSessionError(message) {
    InvalidSessionError.super_.call(this, message);
}

_util.inherits(InvalidSessionError, Error);

module.exports = InvalidSessionError;
