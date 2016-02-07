'use strict';

var _clone = require('clone');

/**
 * Returns a service that represents a single logged in user on the client side.
 * The user object can be initialized on the server, and dynamically injected
 * into a web page being served to the browser.
 */
module.exports = [ function() {
    var _roles = [];
    var _properties = {};
    var _isInitialized = false;

    /**
     * Allows the initialization of the user object prior to instantiation.
     *
     * Note that the roles passed to this method must be an array of strings.
     * Properties may contain complex values.
     *
     * @module app.core.userProvider
     * @method initialize
     * @param {Array} roles An array of roles that the user belongs to
     * @param {Object} properties A map of user properties for the user
     */
    this.initialize = function(roles, properties) {
        if(!(roles instanceof Array)) {
            throw new Error('Invalid user roles specified (arg #1)');
        }
        properties = properties || {};

        for(var index=0; index<roles.length; index++) {
            var role = roles[index];
            if(typeof role !== 'string') {
                throw new Error('User role must be a string: ' + JSON.stringify(role));
            }
            _roles[index] = role.toLowerCase();
        }
        for(var prop in properties) {
            var value = properties[prop];
            _properties[prop] = _clone(value);
        }
        _isInitialized = true;
    };

    this.$get = [ function() {
        if(!_isInitialized) {
            throw new Error('Cannot inject user. The user object has not been initialized');
        }
        return new User(_roles, _properties);
    } ];
}];

/**
 * Represents a user that is currently logged into the system. This object
 * allows client side entities to leverage user information, and to also
 * perform authentication/authorization checks.
 *
 * @class User
 * @constructor
 * @param {Array} roles A list of roles that the user belongs to
 * @param {Array} [properties] A collection of properties associated with the
 *          user object.
 */
function User(roles, properties) {
    // Arg checks omitted - will be handled by the provider.
    this._roles = roles;
    for(var prop in properties) {
        this[prop] = properties[prop];
    }
    this._serviceTokens = this._serviceTokens || {};
}

/**
 * Checks if the user belongs to a specific role.
 *
 * @class User
 * @method hasRole
 * @param {String} role The role that we are checking for
 * @return {Boolean} True if the user has the specified role, false otherwise.
 */
User.prototype.hasRole = function(role) {
    if(typeof role !== 'string' || role.length <=0) {
        throw new Error('Invalid role specified (arg #1)');
    }
    return this._roles.indexOf(role.toLowerCase()) >= 0;
};

/**
 * Returns a service token for the specified service key.
 *
 * @class User
 * @method getServiceToken
 * @param {String} serviceKey The service key that identifies the service
 *          for which the token will be retrieved.
 * @return {Object} A service token for the specified service.
 */
User.prototype.getServiceToken = function(key) {
    if(typeof key !== 'string' || key.length <=0) {
        throw new Error('Invalid service key specified (arg #1)');
    }
    return this._serviceTokens[key];
};
