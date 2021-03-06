/**
 * Main module that launches the web server. This file typically will not
 * require changes. Route changes have to be made in the ./routes sub package,
 * and configuration changes can be introduced using the ./config.js file.
 */

/* jshint node:true */
'use strict';

var _http = require('http');
var _express = require('express');

var _config = require('./config');
var _logger = require('./logger');
var _session = require('./session');
var _dataAccessFactory = require('./data-access-factory');
var _auth = require('./auth');
var _routes = require('./routes');

var app = _express();

// Application configuration.
_config.configure(app);

// Logger configuration
_logger.configure(app);

// Session configuration
_session.configure(app);

// Data access factory configuration
_dataAccessFactory.configure(app);

// Authentication configuration
_auth.configure(app);

// Route configuration.
_routes.configure(app);

// Logger should be initialized by now.
var logger = _logger.getLogger();

// Launch server.
_http.createServer(app).listen(GLOBAL.config.cfg_port, function() {
    var SEPARATOR = (new Array(81)).join('-');

    logger.silly(SEPARATOR);
    logger.info('Express server started.');
    var keys = Object.keys(GLOBAL.config);
    keys.forEach(function(key) {
        logger.info('%s = [%s]', key, GLOBAL.config[key]);
    });
    logger.silly(SEPARATOR);
});
