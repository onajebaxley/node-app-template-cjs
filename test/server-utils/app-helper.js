/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');

/**
 * Test helper for the core app
 *
 * @module test.serverUtils.appHelper
 */
module.exports = {
    /**
     * Returns a mock app object, which is a mock of the express object.
     *
     * @module test.serverUtils.appHelper
     * @method getMockApp
     * @param {Object} [appKeys={}] An optional hash of keys that the app will
     *          use when responding to app.get() calls.
     */
    getMockApp: function(appKeys) {
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
