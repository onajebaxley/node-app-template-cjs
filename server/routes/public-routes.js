/**
 * Defines all routes at the root level of the application.
 */

/* jshint node:true */
'use strict';
var _express = require('express');
var PublicRoutesHandler = require('./public-routes-handler');

module.exports = {
    /**
     * Creates a router object that handles some core root level routes for
     * the application.
     */
    createRouter: function() {
        var router = _express.Router();
        var routesHandler = new PublicRoutesHandler();

        /**
         * Show home page.
         */
        router.get('/',
            routesHandler.getHomePageHandler());

        /**
         * Show help documentation.
         */
        router.get('/help',
            routesHandler.getHelpPageHandler());

        /**
         * Request for application status.
         */
        router.get('/__status',
            routesHandler.getAppStatusHandler());

        return router;
    }
};
