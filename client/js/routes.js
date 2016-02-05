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
            templateUrl: '/views/portal-view.html'
        });

        console.debug('Routes configured');
    }
];
