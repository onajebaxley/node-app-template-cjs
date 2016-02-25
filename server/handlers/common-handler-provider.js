/* jshint node:true */
'use strict';

var _logger = require('../logger');
var _util = require('util');

/**
 * Class that defines common handlers that can be used across
 * multiple routers.
 *
 * @class CommonHandlerProvider
 * @constructor
 */
function CommonHandlerProvider() {
    this._logger = _logger.getLogger();
}

/**
 * Functions as a middleware routine that injects user related variables
 * (username, user object, etc.) as local response variables on the response.
 * These variables can be used by the view as a part of the rendering logic.
 *
 * @class CommonHandlerProvider
 * @method injectUserResponseLocals
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
CommonHandlerProvider.prototype.injectUserResponseLocals = function() {
    return function(req, res, next) {
        if (req.session) {
            res.locals.rv_username = req.session.username;
        }
        res.locals.rv_user = req.user;
        next();
    }.bind(this);
};

module.exports = CommonHandlerProvider;
