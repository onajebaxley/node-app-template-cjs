/**
 * Module that defines ui routes required by the client side application using
 * angular js ui router.
 *
 * Exports an array that includes necessary dependencies, which can then be
 * directly used in an application initialization routine.
 *
 * @module app.routes
 */
'use strict';

var console = require('console');

module.exports = [ '$stateProvider', '$urlRouterProvider', 
    function(stateProvider, urlRouterProvider) {
        // Default route
        urlRouterProvider.otherwise('/');

        // Application routes
        stateProvider.state('home', {
            url: '/',
            templateUrl: '/views/dashboard.home.html',
            controller: 'app.dashboard.HomeController',
            onEnter: [ 'app.layout.breadCrumb', function(breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard'
                } ]);
            } ]
        });

        stateProvider.state('error', {
            url: '/error',
            templateUrl: '/views/routes.error.html',
            controller: 'app.layout.ErrorController',
            onEnter: [ 'app.layout.breadCrumb', function(breadCrumb) {
                breadCrumb.push({
                    title: 'Error'
                });
            } ],
            onExit: [ 'app.layout.breadCrumb', function(breadCrumb) {
                breadCrumb.pop();
            } ]
        });

        stateProvider.state('user', {
            url: '/user',
            templateUrl: '/views/dashboard.user-profile.html',
            controller: 'app.dashboard.UserProfileController',
            onEnter: [ 'app.layout.breadCrumb', function(breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard',
                    routeState: 'home'
                }, {
                    title: 'User Profile'
                } ]);
            } ]
        });

        console.debug('Routes configured');
    }
];
