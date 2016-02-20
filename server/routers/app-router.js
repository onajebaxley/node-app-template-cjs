/**
 * Defines application routes - routes that are related to general application
 * functionality, typically requiring authentication.
 */

/* jshint node:true */
'use strict';

var _express = require('express');
var _passport = require('passport');

var _logger = require('../logger');
var _session = require('../session');
var _auth = require('../auth');
var AppHandlerProvider = require('../handlers/app-handler-provider');
var CommonHandlerProvider = require('../handlers/common-handler-provider');

module.exports = {
    /**
     * Creates a router object that registers routes for all general
     * application functionality for the web application.
     *
     * @module server.routers.appRouter
     * @method createRouter
     * @return {Object} A properly initialized router object.
     */
    createRouter: function() {
        var router = _express.Router();
        var routesHandler = new AppHandlerProvider();
        var commonHandler = new CommonHandlerProvider();

        router.use(_session.getSessionHandler());
        router.use(_passport.initialize());
        router.use(_auth.checkUserSession);
        router.use(_passport.session());
        router.use(commonHandler.injectUserResponseLocals());

        router.get('/', routesHandler.homePageHandler());
        return router;
    }
};
