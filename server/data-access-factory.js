/**
 * Configures and provides data access objects. Each data access object can be
 * configured to connect to a different back end store (REST, SQL, file system,
 * etc.).
 */

/* jshint node:true */
'use strict';

var _util = require('util');
var _logger = require('./logger');
var UserProfileDataAccess = require('./data/user-profile');

var _dataAccessObjectMap = null;
var _isInitialized = false;

module.exports = {
    /**
     * Configures a collection of data access objects, and makes them
     * available to other modules at runtime.
     *
     * @module server.dataAccessFactory
     * @method configure
     * @param {Object} app  A reference to the express App object.
     */
    configure: function(app) {
        if (!app || app instanceof Array || typeof app !== 'function') {
            throw new Error('Invalid app object specified (arg #1)');
        }
        if (_isInitialized) {
            // Already initialized. Do nothing.
            return;
        }

        //TODO: This initialization needs to happen with some meaningful connection
        //parameters. For now, it's a dummy implementation.
        _dataAccessObjectMap = {
            'user-profile': new UserProfileDataAccess()
        };

        _isInitialized = true;
    },

    /**
     * Returns a previously configured data access object based on the
     * specified key.
     *
     * @module server.dataAccessFactory
     * @method getDataAccessObject
     * @param {String} key A key that identifies the type of data access
     *          object to return.
     * @return {Object} A reference to the data access object.
     */
    getDataAccessObject: function(key) {
        if (typeof key !== 'string' || key.length <= 0) {
            throw new Error('Invalid data access object key specified (arg #1)');
        }
        var logger = _logger.getLogger();
        var dao = _dataAccessObjectMap[key];
        if (!dao) {
            throw new Error(_util.format('Could not find data access object with key: [%s]', key));
        }
        return dao;
    }
};
