/* jshint node:true */
'use strict';

var _util = require('util');
var RoutesHandler = require('./routes-handler');

/**
 * Class that defines request handlers for the public route.
 *
 * @class PublicRoutesHandler
 * @constructor
 */
function PublicRoutesHandler() {
    this._runMap = {};

    PublicRoutesHandler.super_.apply(this, Array.prototype.slice.call(arguments, 0));
}

_util.inherits(PublicRoutesHandler, RoutesHandler);

/**
 * Handles a request to show the home page.
 *
 * @method getHomePageHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
PublicRoutesHandler.prototype.getHomePageHandler = function() {
    return this._wrapHandler(function(req, res, next) {
        res.render('index', {});
    }.bind(this));
};

/**
 * Handles a request to show the help page.
 *
 * @method getHelpPageHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
PublicRoutesHandler.prototype.getHelpPageHandler = function() {
    return this._wrapHandler(function(req, res, next) {
        res.render('help', {});
    }.bind(this));
};

/**
 * Handles a request to retrieve current server status.
 *
 * @method getAppStatusHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
PublicRoutesHandler.prototype.getAppStatusHandler = function() {
    return this._wrapHandler(function(req, res, next) {
        var appName = GLOBAL.config.cfg_app_name;
        var appVersion = GLOBAL.config.cfg_app_version;
        res.set({
            'Content-Type': 'application/json',
        });
        res.status(200).send({
            app: appName,
            version: appVersion,
            timestamp: Date.now()
        });
    }.bind(this));
};

module.exports = PublicRoutesHandler;
