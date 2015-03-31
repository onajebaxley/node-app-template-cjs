'use strict';

var angular = require('angular');
var uiRouter = require('angular-ui-router');

var templates = require('./templates');
var helloWorldModule = require('./hello-world-module');

var moduleName = 'app';

angular.module(moduleName, [templates, 'ui.router', helloWorldModule])

    //Route configuration
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/home');

        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/views/home-view.html'
        }).state('help', {
            url: '/help',
            templateUrl: '/views/help-view.html'
        });
    }]);

angular.bootstrap(document, [moduleName]);
console.debug('Application launched');
