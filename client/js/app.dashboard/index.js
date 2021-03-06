'use strict';

var console = require('console');
var angular = require('angular');
var uiRouter = require('angular-ui-router');
var coreModule = require('../app.core');
var layoutModule = require('../app.layout');
var dataModule = require('../app.data');

/**
 * Dashboard module for the application. Provides components that help
 * implement the core functionality of the application.
 *
 * The components defined by this module may be extended and/or augmented
 * as necessary.
 */
var moduleName = 'app.dashboard';
angular.module(moduleName, [ 'ui.router', 'app.core', 'app.layout', 'app.data' ])
    .controller('app.dashboard.HomeController', require('./controllers/home-controller'))
    .controller('app.dashboard.UserProfileController', require('./controllers/user-profile-controller'))
    ;

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
