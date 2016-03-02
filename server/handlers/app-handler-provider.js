/* jshint node:true */
'use strict';

var _logger = require('../logger');
var _util = require('util');

/**
 * Class that defines request handlers for application functionality. These 
 * resources are typically protected, requiring an authenicated user to access
 * them.
 *
 * @class AppHandlerProvider
 * @constructor
 */
function AppHandlerProvider() {
    this._logger = _logger.getLogger();
}

/**
 * Handles a request to show the users home page.
 *
 * @class AppHandlerProvider
 * @method homePageHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
AppHandlerProvider.prototype.homePageHandler = function() {
    return function(req, res, next) {
        res.render('dashboard', {});
    }.bind(this);
};

module.exports = AppHandlerProvider;
