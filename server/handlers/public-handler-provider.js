/* jshint node:true */
'use strict';

var _logger = require('../logger');
var _util = require('util');

/**
 * Class that defines request handlers for the public route.
 *
 * @class PublicHandlerProvider
 * @constructor
 * @param {String} appName The name of the current application
 * @param {String} appVersion The current application version
 */
function PublicHandlerProvider(appName, appVersion) {
    if (typeof appName !== 'string' || appName.length <= 0) {
        throw new Error('Invalid app name specified (arg #1)');
    }
    if (typeof appVersion !== 'string' || appVersion.length <= 0) {
        throw new Error('Invalid app version specified (arg #2)');
    }
    this._logger = _logger.getLogger();
    this._appName = appName;
    this._appVersion = appVersion;
}

/**
 * Handles a request to show the public portal/landing page for the
 * app.
 *
 * @class PublicHandlerProvider
 * @method portalPageHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
PublicHandlerProvider.prototype.portalPageHandler = function() {
    return function(req, res, next) {
        res.render('portal', {});
    }.bind(this);
};

/**
 * Handles a request to retrieve current server status.
 *
 * @class PublicHandlerProvider
 * @method appStatusHandler
 * @return {Function} A handler that conforms to expressjs' handler
 *                    signature.
 */
PublicHandlerProvider.prototype.appStatusHandler = function() {
    return function(req, res, next) {
        res.set({
            'content-type': 'application/json',
        });

        res.status(200).send({
            app: this._appName,
            version: this._appVersion,
            timestamp: Date.now()
        });
    }.bind(this);
};

module.exports = PublicHandlerProvider;
