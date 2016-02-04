/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');

/**
 * Test helper for testing angularjs controllers
 *
 * @module test.utils.controllerHelper
 */
module.exports = {
    /**
     * Creates a fuction that can be used to inject a controller into the
     * test framework.
     *
     * @module test.utils.controllerHelper
     * @method injectController
     * @param {String} controllerName The name of the controller to inject.
     * @param {Object} [mocks={}] An optional hash of mocks that contain mock
     *          objects that are injected into the controller.
     */
    injectController: function(appKeys) {
        appKeys = appKeys || {};
        appKeys.env = appKeys.env || 'development';
        var app = function() {};

        app.get = function(key) {
            return appKeys[key];
        };

        app.set = function(key, value) {
            appKeys[key] = value;
        };

        app.use = _sinon.spy();

        app.locals = {};
        return app;
    }
};
