/**
 * Defines public routes for the web applications - routes that are available
 * without requiring any authentication.
 */

/* jshint node:true */
'use strict';

var _express = require('express');
var _logger = require('../logger');
var PublicHandlerProvider = require('../handlers/public-handler-provider');

module.exports = {
    /**
     * Creates a router object that registers routes for all public (non
     * authenticated) resources of the web application.
     *
     * @module server.routers.publicRouter
     * @method createRouter
     * @return {Object} A properly initialized router object.
     */
    createRouter: function() {
        var router = _express.Router();
        var routesHandler = new PublicHandlerProvider(GLOBAL.config.cfg_app_name,
            GLOBAL.config.cfg_app_version);

        router.get('/', routesHandler.portalPageHandler());
        router.get('/__status', routesHandler.appStatusHandler());

        return router;
    }
};
