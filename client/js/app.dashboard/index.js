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
    .controller('app.dashboard.UserProfileController', require('./controllers/user-profile-controller'))
    .controller('app.dashboard.ExploreController', require('./controllers/explore-controller'))
    .controller('app.dashboard.AccountSettingsController', require('./controllers/account-settings-controller'))
    //.factory('app.dashboard.breadCrumb', require('./services/bread-crumb'))
    //.controller('app.dashboard.LeftSidebarController', require('./controllers/left-sidebar-controller'))
    ;

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
