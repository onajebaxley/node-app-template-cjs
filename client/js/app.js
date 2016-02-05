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

//Application configuration settings
.constant('app.SETTINGS', {
    app_title: window.cfg_app_title,
    app_version: window.cfg_app_version,
    root_path: window.cfg_root_path
})

//UI Route configuration
.config(routes)

//Icon configuration
.config(icons)

.controller('app.layout.MasterLayoutController', [ '$scope', function($scope) {
}]);

//angular.bootstrap(document, [moduleName]);
console.info('Application ready');
