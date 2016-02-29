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

var templates = require('./templates');
var coreModule = require('./app.core');
var authModule = require('./app.auth');
var layoutModule = require('./app.layout');

angular.module(moduleName, [
    templates,
    'ngMaterial',
    'ui.router',
    coreModule,
    authModule
])

// UI Route configuration
.config(routes)

// Icon configuration
.config(icons)

// Theme configuration
.config(themes)

.controller('app.layout.MasterLayoutController1', [ '$scope', '$mdSidenav', '$mdMedia', 'app.core.user',
    function($scope, $mdSidenav, user) {
        $scope.user = user;

        $scope.leftSidebarState = {
            isPinned: true,
            isExpanded: false,
            isOpen: false
        };
        $scope.pin_icon = 'radio_button_checked';

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
