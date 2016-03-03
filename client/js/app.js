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

angular.module(moduleName, [
    templates,
    'ngMaterial',
    'ui.router',
    coreModule,
    dataModule,
    layoutModule,
    authModule
])

// UI Route configuration
.config(routes)

// Icon configuration
.config(icons)

// Theme configuration
.config(themes)

// Layout configuration
.config(layout)

.controller('app.layout.LeftSidebarController', [ '$scope', 'app.core.user',
    function($scope, $mdSidenav, user) {
        $scope.user = user;

        $scope.expandLeftSidebar = function() {
            $scope.leftSidebarState.isExpanded = true;
        };

        $scope.collapseLeftSidebar = function() {
            $scope.leftSidebarState.isExpanded = false;
        };

        $scope.togglePinLeftSidebar = function() {
            $scope.leftSidebarState.isPinned = !$scope.leftSidebarState.isPinned;
            $scope.pin_icon = ($scope.leftSidebarState.isPinned)? 'radio_button_checked': 'radio_button_unchecked';
        };

        $scope.toggleOpenLeftSidebar = function() {
            $scope.leftSidebarState.isOpen = !$scope.leftSidebarState.isOpen;
        };
    }
])
;

//angular.bootstrap(document, [moduleName]);
console.info('Application ready');
