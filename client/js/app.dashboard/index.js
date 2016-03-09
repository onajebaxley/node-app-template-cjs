'use strict';

var console = require('console');
var angular = require('angular');
var uiRouter = require('angular-ui-router');
var coreModule = require('../app.core');
var layoutModule = require('../app.layout');
var ngResource = require('angular-resource');

/**
 * Dashboard module for the application. Provides components that help
 * implement the core functionality of the application.
 *
 * The components defined by this module may be extended and/or augmented
 * as necessary.
 */
var moduleName = 'app.dashboard';
angular.module(moduleName, [ 'ui.router', 'ngResource', 'app.core', 'app.layout' ])
    .controller('app.dashboard.ExploreController', require('./controllers/explore-controller'))
    .controller('app.dashboard.AccountSettingsController', require('./controllers/account-settings-controller'))
    //.factory('app.layout.MenuItem', require('./services/menu-item'))
    //.factory('app.layout.breadCrumb', require('./services/bread-crumb'))
    //.controller('app.layout.LeftSidebarController', require('./controllers/left-sidebar-controller'))
    ;

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
