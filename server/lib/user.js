/* jshint node:true */
'use strict';

var _clone = require('clone');

/**
 * Defines a class that represents a logged in user.
 *
 * @class server.lib.User
 * @constructor
 * @param {String} username The user username of the user (unique login id)
 * @param {Array} roles A list of strings that represents the roles that the
 *          user belongs to
 * @param {Object} userProperties A map of user properties associated with the
 *          user. Every property in this map will be included as a property of
 *          the user object.
 */
function User(username, roles, userProperties) {
    if (typeof username !== 'string' || username.length <= 0) {
        throw new Error('Invalid user name specified (arg #1)');
    }
    this._serviceTokens = {};
    this._roles = [];
    if (roles instanceof Array) {
        roles.forEach(function(role) {
            this._roles.push(role.toLowerCase());
        }.bind(this));
    }
    userProperties = userProperties || {};
    userProperties.username = username;
    for (var prop in userProperties) {
        this[prop] = _clone(userProperties[prop]);
    }
}

/**
 * Determines whether or not the user belongs to a specific role. Role names
 * are case insensitive.
 *
 * @class server.lib.User
 * @method hasRole
 * @param {String} role The role that we are checking for
 * @return {Boolean} True if the user has the specified role, false otherwise.
 */
User.prototype.hasRole = function(role) {
    if (typeof role !== 'string' || role.length <= 0) {
        throw new Error('Invalid role specified (arg #1)');
    }
    return this._roles.indexOf(role.toLowerCase()) >= 0;
};

/**
 * Returns a list of all roles associated with the user.
 *
 * @class server.lib.User
 * @method getRoles
 * @return {Array} A list of roles that the user belongs to
 */
User.prototype.getRoles = function() {
    return _clone(this._roles);
};

/**
 * Saves a service token for the user. These tokens are typically intended for
 * consumption on the client side, though they could be used to access services
 * from the server as well.
 *
 * @class server.lib.User
 * @method setServiceToken
 * @param {String} serviceKey A string that uniquely identifies the service for
 *          which the token is being set.
 * @param {Object} token The service token. This could be a complex object, or
 *          just a simple string.
 */
User.prototype.setServiceToken = function(serviceKey, token) {
    if (typeof serviceKey !== 'string' || serviceKey.length <= 0) {
        throw new Error('Invalid service key specified (arg #1)');
    }
    if (typeof token === 'undefined' || token === null || typeof token === 'function') {
        throw new Error('Invalid service token specified (arg #2)');
    }
    this._serviceTokens[serviceKey] = _clone(token);
};

/**
 * Returns a service token for the specified service key.
 *
 * @class server.lib.User
 * @method getServiceToken
 * @param {String} serviceKey A string that uniquely identifies the service for
 *          which the token is being set.
 * @return {Object} The service token corresponding to the specified key.
 */
User.prototype.getServiceToken = function(serviceKey) {
    if (typeof serviceKey !== 'string' || serviceKey.length <= 0) {
        throw new Error('Invalid service key specified (arg #1)');
    }
    return this._serviceTokens[serviceKey];
}

/**
 * Returns a serialized version of the current user object, containing all
 * associated with the user.
 *
 * @class server.lib.User
 * @method serialize
 * @return {Object} A map of properties associated with the user
 */
User.prototype.serialize = function() {
    var properties = {};
    for (var prop in this) {
        var value = this[prop];
        if (typeof value !== 'function') {
            properties[prop] = _clone(value);
        }
    }
    return properties;
};

module.exports = User;
