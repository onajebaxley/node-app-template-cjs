/* jshint node:true */
'use strict';

var _clone = require('clone');

/**
 * Defines a class that represents a base data access object.
 *
 * @class server.data.DataAccess
 * @constructor
 * @param {Object} [connectionParams] An optional map containing properties
 *          that will allow the object to connect to a data store.
 */
function DataAccess(connectionParams) {
    if(!connectionParams || (connectionParams instanceof Array)
        || typeof connectionParams !== 'object') {
            connectionParams = {};
    }
    this._connectionParams = _clone(connectionParams);
}

module.exports = DataAccess;
