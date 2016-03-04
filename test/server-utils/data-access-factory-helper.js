/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _appHelper = require('./app-helper');
var _loggerHelper = require('./logger-helper');
var _rewire = require('rewire');

/**
 * Test helper for the data access factory module
 *
 * @module test.serverUtils.dataAccessFactoryHelper
 */
module.exports = {

    /**
     * Initializes actual data access factory module with dummy parameters.
     *
     * @module test.serverUtils.dataAccessFactoryHelper
     * @method initDataAccessFactory
     * @param {Boolean} [configure=false] If set to true, automatically
     *          configures the logger with an empty app.
     * @return {Object} Reference to the data access factory object
     */
    initDataAccessFactory: function(configure) {
        configure = !!configure;

        var dataAccessFactory = _rewire('../../server/data-access-factory');
        dataAccessFactory.__set__('_logger', _loggerHelper.initLogger(true));

        if (configure) {
            dataAccessFactory.configure(_appHelper.getMockApp());
        }

        return dataAccessFactory;
    }
};
