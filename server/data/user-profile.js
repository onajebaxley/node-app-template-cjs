/* jshint node:true */
'use strict';

var _util = require('util');
var _q = require('q');
var _clone = require('clone');

var DataAccess = require('./data-access');
var _promiseUtils = require('../utils/promise-utils');

/**
 * Defines a class that functions as a data access object for user profiles.
 *
 * @class server.data.UserProfile
 * @constructor
 * @param {Object} [connectionParams] An optional map containing properties
 *          that will allow the object to connect to a data store.
 */
function UserProfile(connectionParams) {
    UserProfile.super_.call(this, connectionParams);

    //TODO: This class does not access an actual persistent store. That
    //functionality is left to an actual real world implementation.
    this._DUMMY_USER_LIST= [ {
        username: 'pparker',
        firstName: 'Peter',
        lastName: 'Parker',
        title: 'Spiderman',
        roles: [ 'superhero', 'reporter' ]
    }, {
        username: 'todinson',
        firstName: 'Thor',
        lastName: 'Odinson',
        title: 'Thor',
        roles: [ 'superhero', 'demigod' ]
    }, {
        username: 'tstark',
        firstName: 'Tony',
        lastName: 'Stark',
        title: 'Iron Man',
        roles: [ 'superhero', 'engineer' ]
    }, {
        username: 'nosborne',
        firstName: 'Norman',
        lastName: 'Osborne',
        title: 'Green Goblin',
        roles: [ 'villain', 'businessman' ]
    }, {
        username: 'llaufeyson',
        firstName: 'Loki',
        lastName: 'Laufeyson',
        title: 'Loki',
        roles: [ 'villain', 'demigod' ]
    }, {
        username: 'vvdoom',
        firstName: 'Victor',
        lastName: 'Von Doom',
        title: 'Dr. Doom',
        roles: [ 'villain', 'engineer' ]
    } ];
}

_util.inherits(UserProfile, DataAccess);

/**
 * Looks up a specific user from persistent storage, and returns user
 * profile information.
 *
 * @class server.data.UserProfile
 * @method lookupUser
 * @param {String} username The username of the user to lookup.
 * @return {Object} A promise that will be rejected or resolved based on
 *          the result of the lookup operation. If successful, the promise
 *          will be resolved with the user profile data of the specified
 *          user.
 */
UserProfile.prototype.lookupUser = function(username) {
    if(typeof username !== 'string' || username.length <= 0) {
        throw new Error('Invalid username specified (arg #1)');
    }
    var def = _q.defer();
    
    var action = _promiseUtils.wrapWithExceptionHandler(function() {
        this._DUMMY_USER_LIST.forEach(function(user) {
            if(user.username === username) {
                def.resolve(user);
                return;
            }
        });
        def.resolve(null);
    }.bind(this), def);

    //Give up control to simulate async call.
    process.nextTick(action);

    return def.promise;
};

/**
 * Saves data for a specific user to persistent storage.
 *
 * @class server.data.UserProfile
 * @method saveUser
 * @param {String} username The username of the user to save.
 * @param {Object} data The user profile data to save.
 * @return {Object} A promise that will be rejected or resolved based on
 *          the result of the lookup operation.
 */
UserProfile.prototype.saveUser = function(username, data) {
    if(typeof username !== 'string' || username.length <= 0) {
        throw new Error('Invalid username specified (arg #1)');
    }
    if(!data || data instanceof Array || typeof data !== 'object') {
        throw new Error('Invalid profile data specified (arg #2)');
    }
    var def = _q.defer();
    
    var action = _promiseUtils.wrapWithExceptionHandler(function() {
        this._DUMMY_USER_LIST[username] = _clone(data);
        def.resolve(null);
    }.bind(this), def);

    //Give up control to simulate async call.
    process.nextTick(action);

    return def.promise;
};

/**
 * Finds a list of users that match the specified search criteria.
 *
 * @class server.data.UserProfile
 * @method findUsers
 * @param {Object} searchCriteria An object containing a map of search
 *          criteria used to find matching users.
 * @return {Object} A promise that will be rejected or resolved based on
 *          the result of the lookup operation.
 */
UserProfile.prototype.findUsers = function(searchCriteria) {
    if(!searchCriteria || searchCriteria instanceof Array || typeof searchCriteria !== 'object') {
        throw new Error('Invalid search criteria specified (arg #1)');
    }
    var def = _q.defer();
    
    var action = _promiseUtils.wrapWithExceptionHandler(function() {
        var results = this._DUMMY_USER_LIST.filter(function(item) {
            var matchAll = true;
            var propCount = 0;
            for(var prop in searchCriteria) {
                var itemProp = item[prop];
                if(typeof itemProp === 'string') {
                    if(itemProp.indexOf(searchCriteria[prop]) !== 0) {
                        matchAll = false;
                    }
                    propCount++;
                }
            }
            return matchAll && propCount > 0;
        });
        def.resolve(results);
    }.bind(this), def);

    //Give up control to simulate async call.
    process.nextTick(action);

    return def.promise;
};

module.exports = UserProfile;
