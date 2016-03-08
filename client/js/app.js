/**
 * Entry point for the javascript application. Initializes all required modules
 * and ui routes.
 *
 * @module app
 */
'use strict';

var console = require('console');
var angular = require('angular');
var angularMaterial = require('angular-material');
var uiRouter = require('angular-ui-router');
var ngResource = require('angular-resource');

var moduleName = 'app';

var routes = require('./routes');
var icons = require('./icons');
var themes = require('./themes');
var layout = require('./layout');

var templates = require('./templates');
var coreModule = require('./app.core');
var layoutModule = require('./app.layout');
var dataModule = require('./app.data');
var authModule = require('./app.auth');
var dashboardModule = require('./app.dashboard');

angular.module(moduleName, [
    templates,
    'ngMaterial',
    'ui.router',
    'ngResource',
    coreModule,
    dataModule,
    layoutModule,
    authModule,
    dashboardModule
])

// UI Route configuration
.config(routes)

// Icon configuration
.config(icons)

// Theme configuration
.config(themes)

// Layout configuration
.config(layout)

//.controller('app.layout.LeftSidebarController', [ '$scope', 'app.layout.MenuItem',
//    function($scope, MenuItem) {
//        $scope.menu = new MenuItem({
//            title: '__sidebarMenu',
//            childItems: [ ]
//        });
//    }
//])
;

//angular.bootstrap(document, [moduleName]);
console.info('Application ready');
