/**
 * Defines all routes at the root level of the application.
 */

/* jshint node:true */
'use strict';
var _express = require('express');
var PublicHandler = require('./public-routes-handler');

module.exports = {
    /**
     * Creates a router object that handles some core root level routes for
     * the application.
     */
    createRouter: function() {
        var router = _express.Router();
        var publicHandler = new PublicHandler();

        /**
         * Show home page.
         */
        router.get('/',
            publicHandler.getHomePageHandler());

        /**
         * Show help documentation.
         */
        router.get('/help',
            publicHandler.getHelpPageHandler());

        /**
         * Request for application status.
         */
        router.get('/__status',
            publicHandler.getAppStatusHandler());

        return router;
    }
};
