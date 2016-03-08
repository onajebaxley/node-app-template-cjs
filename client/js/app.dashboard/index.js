'use strict';

var console = require('console');
var angular = require('angular');

/**
 * Dashboard module for the application. Provides components that help
 * implement the core functionality of the application.
 * 
 * The components defined by this module may be extended and/or augmented 
 * as necessary.
 */
var moduleName = 'app.dashboard';
angular.module(moduleName, [ 'ui.router', 'app.core' ])
    //.factory('app.layout.MenuItem', require('./services/menu-item'))
    //.factory('app.layout.breadCrumb', require('./services/bread-crumb'))
    //.controller('app.layout.LayoutController', require('./controllers/layout-controller'))
    //.controller('app.layout.LeftSidebarController', require('./controllers/left-sidebar-controller'))
    ;

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
