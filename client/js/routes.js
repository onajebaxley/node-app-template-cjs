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
            controller: 'app.dashboard.ExploreController'
        });

        stateProvider.state('nodes', {
            url: '/nodes',
            templateUrl: '/views/dashboard-explore.html',
            controller: [ '$scope', 'app.layout.breadCrumb', function($scope, breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard',
                    routeState: 'explore'
                }, {
                    title: 'Nodes',
                    routeState: 'nodes'
                }]);
            } ]
        });

        stateProvider.state('create_node', {
            url: '/create-node',
            templateUrl: '/views/dashboard-explore.html',
            controller: [ '$scope', 'app.layout.breadCrumb', function($scope, breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard',
                    routeState: 'explore'
                }, {
                    title: 'Nodes',
                    routeState: 'nodes'
                }, 'Create']);
            } ]
        });

        stateProvider.state('gateways', {
            url: '/gateways',
            templateUrl: '/views/dashboard-explore.html',
            controller: [ '$scope', 'app.layout.breadCrumb', function($scope, breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard',
                    routeState: 'explore'
                }, {
                    title: 'Gateways',
                    routeState: 'gateways'
                }]);
            } ]
        });

        stateProvider.state('create_gateway', {
            url: '/create-gateway',
            templateUrl: '/views/dashboard-explore.html',
            controller: [ '$scope', 'app.layout.breadCrumb', function($scope, breadCrumb) {
                breadCrumb.setCrumbs([ {
                    title: 'Dashboard',
                    routeState: 'explore'
                }, {
                    title: 'Gateways',
                    routeState: 'gateways'
                }, 'Create']);
            } ]
        });

        console.debug('Routes configured');
    }
];
