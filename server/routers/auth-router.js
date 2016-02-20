/**
 * Defines authentication related routes - show login page, login and logout.
 */

/* jshint node:true */
'use strict';

var _express = require('express');
var _passport = require('passport');
var _bodyParser = require('body-parser');

var _session = require('../session');
var _logger = require('../logger');
var AuthHandlerProvider = require('../handlers/auth-handler-provider');
var CommonHandlerProvider = require('../handlers/common-handler-provider');

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
        var commonHandler = new CommonHandlerProvider();

        router.use(_session.getSessionHandler());
        router.use(_passport.initialize());
        router.use(commonHandler.injectUserResponseLocals());

        router.get('/login', routesHandler.loginPageHandler());
        router.get('/logout',
            _passport.session(),
            routesHandler.logoutHandler());
        router.post('/login',
            _bodyParser.urlencoded({
                extended: false
            }),
            routesHandler.authUsernamePasswordHandler());

        return router;
    }
};
