/**
 * Module that defines ui routes required by the client side application using
 * angular js ui router.
 *
 * Exports an array that includes necessary dependencies, which can then be
 * directly used in an application initialization routine.
 *
 * @module client.routes
 */
/**
 */
'use strict';

var console = require('console');

module.exports = [ '$stateProvider', '$urlRouterProvider', 
    function(stateProvider, urlRouterProvider) {

        // Default route
        urlRouterProvider.otherwise('/');

        // Application routes
        stateProvider.state('portal', {
            url: '/',
            templateUrl: '/views/portal-view.html'
        }).state('help', {
            url: '/help',
            templateUrl: '/views/help-view.html'
        });

        console.debug('Routes configured');
    }
];
