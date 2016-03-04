'use strict';

var console = require('console');
var angular = require('angular');

/**
 * Core module for the application. Defines common controllers/directives/
 * services that are used across the application. The entities defined by
 * this module are largely ui agnostic, and are intended to be used by
 * other modules within the application.
 */
var moduleName = 'app.core';
angular.module(moduleName, [ ])
    .provider('app.core.config', require('./services/config'))
    .provider('app.core.user', require('./services/user'))
    .factory('app.core.utils', require('./services/utils'))
    ;

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
