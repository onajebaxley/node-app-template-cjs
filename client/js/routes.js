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
        urlRouterProvider.otherwise('/explore');

        // Application routes
        stateProvider.state('explore', {
            url: '/explore',
            templateUrl: '/views/dashboard-explore.html',
            controller: 'app.dashboard.ExploreController',
            onEnter: [ 'app.layout.breadCrumb', function(breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard'
                } ]);
            } ]
        });

        stateProvider.state('error', {
            url: '/error',
            templateUrl: '/views/error.html',
            controller: 'app.layout.ErrorController',
            onEnter: [ 'app.layout.breadCrumb', function(breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard',
                    routeState: 'explore'
                }, {
                    title: 'Error'
                } ]);
            } ]
        });

        stateProvider.state('user', {
            url: '/user',
            templateUrl: '/views/dashboard-user-profile.html',
            controller: 'app.dashboard.UserProfileController',
            onEnter: [ 'app.layout.breadCrumb', function(breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard',
                    routeState: 'explore'
                }, {
                    title: 'User Profile'
                } ]);
            } ]
        });

        stateProvider.state('nodes', {
            url: '/nodes',
            templateUrl: '/views/dashboard-explore.html'
        });

        stateProvider.state('create_node', {
            url: '/create-node',
            templateUrl: '/views/dashboard-explore.html'
        });

        stateProvider.state('gateways', {
            url: '/gateways',
            templateUrl: '/views/dashboard-explore.html'
        });

        stateProvider.state('create_gateway', {
            url: '/create-gateway',
            templateUrl: '/views/dashboard-explore.html'
        });

        stateProvider.state('account', {
            url: '/account',
            templateUrl: '/views/dashboard-account-settings.html',
            controller: 'app.dashboard.AccountSettingsController'
        });


        console.debug('Routes configured');
    }
];
