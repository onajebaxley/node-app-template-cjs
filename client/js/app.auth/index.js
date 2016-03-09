'use strict';

var console = require('console');
var angular = require('angular');
var coreModule = require('../app.core');
var layoutModule = require('../app.layout');

/**
 * Authentication module that defines controllers/directives/services that are
 * used for authentication and authorization.
 */
var moduleName = 'app.auth';
angular.module(moduleName, [ 'app.core', 'app.layout' ])
    .controller('app.auth.LoginController', require('./controllers/login-controller'))
    ;

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
