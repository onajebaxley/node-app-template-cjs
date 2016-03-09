'use strict';

var _clone = require('clone');
var _screenfull = require('screenfull');

/**
 * Controller for the left sidebar.
 *
 * @module app.layout.LeftSidebarController
 */
module.exports = [ '$scope', 'app.core.config', 'app.layout.MenuItem',
    function($scope, config, MenuItem ) {

        var rootPath = config.get('root_path');
        $scope.menu = new MenuItem({
            title: '__sidebar_menu',
            childItems: [{
                title: 'home',
                iconName: 'home',
                link: rootPath,
                position: 0
            }, {
                title: 'explore',
                iconName: 'explore',
                routeState: 'explore',
                position: 1
            }, {
                title: 'view/manage nodes',
                iconName: 'device_hub',
                routeState: 'nodes',
                position: 2
            }, {
                title: 'view/manage gateways',
                iconName: 'widgets',
                routeState: 'gateways',
                position: 3
            }, {
                title: 'create a new node',
                iconName: 'memory',
                routeState: 'create_node',
                position: 4
            }, {
                title: 'create a new gateway',
                iconName: 'router',
                routeState: 'create_gateway',
                position: 5
            }, {
                title: 'manage account settings',
                iconName: 'settings',
                routeState: 'account',
                roles: ['admin'],
                position: 6
            }, {
                title: 'help',
                iconName: 'help',
                link: rootPath + 'about',
                position: 7
            }]
        });

        // --------------------------------------------------------------------
        // Private members
        // --------------------------------------------------------------------
    }
];
