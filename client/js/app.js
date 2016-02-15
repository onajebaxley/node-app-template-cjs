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

.controller('app.layout.MasterLayoutController', [ '$scope', '$mdSidenav', 'app.core.user',
    function($scope, $mdSidenav, user) {
        $scope.user = user;
    }
])
;

//angular.bootstrap(document, [moduleName]);
console.info('Application ready');
