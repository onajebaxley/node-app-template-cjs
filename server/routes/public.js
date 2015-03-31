/**
 * Defines all routes at the root level of the application.
 */

/* jshint node:true */
'use strict';
var _express = require('express');

module.exports = {
    /**
     * Creates a router object that handles some core root level routes for
     * the application.
     */
    createRouter: function() {
        var router = _express.Router();

        /**
         * Show home page.
         */
        router.get('/', function(req, res) {
            res.render('index', {});
        });

        /**
         * Show help documentation.
         */
        router.get('/help', function(req, res) {
            res.render('help', {});
        });

        /**
         * Request for application status.
         */
        router.get('/__status', function(req, res) {
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
        });

        return router;
    }
};
