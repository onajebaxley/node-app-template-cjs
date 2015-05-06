/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var MockReq = require('mock-req');
var MockRes = require('mock-res');


var _originalGetLogger = null;

/**
 * Module of utility methods useful for testing.
 *
 * @module TestUtils
 */
module.exports = {
    _logger: {
        silly: _sinon.spy(),
        debug: _sinon.spy(),
        verbose: _sinon.spy(),
        info: _sinon.spy(),
        warn: _sinon.spy(),
        error: _sinon.spy(),
        log: _sinon.spy()
    },

    /**
     * Initializes a global logger object that can be used by other modules.
     */
    initLogger: function() {
        _originalGetLogger = GLOBAL.getLogger;
        GLOBAL.getLogger = function() {};
        _sinon.stub(GLOBAL, 'getLogger', function() {
            return module.exports._logger;
        });
    },

    /**
     * Restores the original logger (overridden by initLogger()).
     */
    resetLogger: function() {
        GLOBAL.getLogger = _originalGetLogger;
        _originalGetLogger = null
    }
};
