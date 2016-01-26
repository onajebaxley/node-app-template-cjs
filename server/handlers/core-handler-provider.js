/* jshint node:true */
'use strict';

var _path = require('path');
var _util = require('util');
var _morgan = require('morgan');
var _browserifyMiddleware = require('browserify-middleware');
var _nodeSassMiddleware = require('node-sass-middleware');
var _favicon = require('serve-favicon');

var _logger = require('../logger');
var InvalidSessionError = require('../lib/invalid-session-error');

/**
 * Class that defines request handlers for core system routes.
 *
 * @class CoreHandlerProvider
 * @constructor
 * @param {String} staticDir The path to the directory containing static files.
 * @param {String} rootPath The path to the root of the web application.
 */
function CoreHandlerProvider(staticDir, rootPath) {
    if (typeof staticDir !== 'string' || staticDir.length <= 0) {
        throw new Error('Invalid static directory specified (arg #1)');
    }
    if (typeof rootPath !== 'string' || rootPath.length <= 0) {
        throw new Error('Invalid root path specified (arg #2)');
    }

    this._logger = _logger.getLogger();
    this._staticDir = staticDir;
    this._rootPath = rootPath;
}

/**
 * Returns a middleware processor that performs access logging.
 *
 * @class CoreHandlerProvider
 * @method accessLoggerMiddleware
 * @return {Function} A handler that conforms to expressjs' handler signature.
 */
CoreHandlerProvider.prototype.accessLoggerMiddleware = function() {
    var accessLogger = _logger.getLogger('access');
    var winstonStream = {
        write: function(message, encoding) {
            // We're piping from Morgan to Winston. There will be an extra
            // newline character that has to be trimmed.
            accessLogger.info(message.slice(0, -1));
        }
    };

    return _morgan('common', {
        stream: winstonStream
    });
};

/**
 * Returns a middleware processor that performs dynamic js compilation,
 * combining multiple individual source file into a single javascript file.
 * Intended for development use only. Production deployments should browserify
 * the source modules prior to deployment.
 *
 * @class CoreHandlerProvider
 * @method dynamicCssCompileMiddleware
 * @param {String} [jsFile=/js/app.js] An optional sub path to the main js file.
 * @return {Function} A handler that conforms to expressjs' handler signature.
 */
CoreHandlerProvider.prototype.dynamicJsCompileMiddleware = function(jsFile) {
    if (typeof jsFile !== 'string' || jsFile.length <= 0) {
        jsFile = '/js/app.js';
    }

    var sourcePath = _path.join(this._staticDir, jsFile);

    // Dynamically generates a bundled javascript file from individual source
    // javascript files.
    return _browserifyMiddleware(sourcePath);
};

/**
 * Returns a middleware processor that performs dynamic css compilation,
 * compiling Sass files into  their corresponding css equivalent.
 * Intended for development use only. Production deployments should pre compile
 * sass files to css prior to deployment.
 *
 * @class CoreHandlerProvider
 * @method dynamicCssCompileMiddleware
 * @return {Function} A handler that conforms to expressjs' handler signature.
 */
CoreHandlerProvider.prototype.dynamicCssCompileMiddleware = function() {
    // Dynamically generates css files from sass files.
    return _nodeSassMiddleware({
        src: this._staticDir,
        prefix: this._rootPath,
        debug: true,
        response: true,
        outputStyle: 'nested'
    });
};

/**
 * Returns a handler function that can handle requests for the favicon.ico
 * file.
 *
 * @class CoreHandlerProvider
 * @method faviconHandler
 * @param {String} [filePath=img/favicon.ico] The path to the favicon.ico file.
 * @return {Function} A handler that conforms to expressjs' handler signature.
 */
CoreHandlerProvider.prototype.faviconHandler = function(filePath) {
    if (typeof filePath !== 'string' || filePath.length <= 0) {
        filePath = 'img/favicon.ico';
    }
    return _favicon(_path.join(this._staticDir, filePath));
};

/**
 * Returns a handler function that can handle errors arising from requests
 * for resources that do not exist on the server (http 404 errors).
 *
 * @class CoreHandlerProvider
 * @method resourceNotFoundErrorHandler
 * @return {Function} A handler that conforms to expressjs' handler signature.
 */
CoreHandlerProvider.prototype.resourceNotFoundErrorHandler = function() {
    return function(req, res, next) {
        res.status(404);
        res.render('error', {
            code: 404,
            primaryMessage: 'We could not find what you were looking for.',
            secondaryMessage: 'Perhaps you typed it in incorrectly?',
            errorInfo: req.path
        });
    }.bind(this);
};

/**
 * Returns a handler function that can handle authentication errors that
 * typically arise because the user's authenticated session token is invalid or
 * out of date.
 *
 * @class CoreHandlerProvider
 * @method authenticationErrorHandler
 * @param {String} [loginPage=/auth/login] The path to the login page.
 * @return {Function} A handler that conforms to expressjs' handler signature.
 */
CoreHandlerProvider.prototype.authenticationErrorHandler = function(loginPage) {
    if (typeof loginPage !== 'string' || loginPage.length <= 0) {
        loginPage = '/auth/login';
    }
    return function(err, req, res, next) {
        if (err instanceof InvalidSessionError) {
            res.redirect(loginPage + '?redirect=' + req.path);
        } else {
            next(err);
        }
    }.bind(this);
};

/**
 * Returns a handler function that can handle general purpose errors. This
 * handler serves as a catch all for any error that occurs during request
 * processing.
 *
 * @class CoreHandlerProvider
 * @method catchAllErrorHandler
 * @return {Function} A handler that conforms to expressjs' handler signature.
 */
CoreHandlerProvider.prototype.catchAllErrorHandler = function() {
    var appLogger = _logger.getLogger('app');
    return function(err, req, res, next) {
        appLogger.error(err.toString());
        res.status(500);
        res.render('error', {
            code: 500,
            primaryMessage: 'Oops. Something went wrong.',
            secondaryMessage: '',
            errorInfo: err.toString()
        });
    }.bind(this);
};

module.exports = CoreHandlerProvider;
