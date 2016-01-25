/**
 * Defines authentication related routes - show login page, login and logout.
 */

/* jshint node:true */
'use strict';

var _express = require('express');
var _passport = require('passport');

var _session = require('../session');
var _logger = require('../logger');
var AuthHandlerProvider = require('../handlers/auth-handler-provider');

module.exports = {
    /**
     * Creates a router object that registers routes for all authentication
     * related actions.
     *
     * @module server.routers.authRouter
     * @method createRouter
     * @return {Object} A properly initialized router object.
     */
    createRouter: function() {
        var router = _express.Router();
        var routesHandler = new AuthHandlerProvider('/');

        router.use(_session.getSessionHandler());
        router.use(_passport.initialize());

        router.get('/login', routesHandler.loginPageHandler());
        router.get('/logout', routesHandler.logoutHandler());
        router.post('/login', routesHandler.authUsernamePasswordHandler());

        return router;
    }
};
