'use strict';

var _clone = require('clone');
var _screenfull = require('screenfull');

/**
 * Controller for the left sidebar.
 *
 * @module app.auth.LeftSidebarController
 */
module.exports = [ '$scope', 'app.core.config', 'app.layout.MenuItem',
    function($scope, config, MenuItem ) {

        var rootPath = config.get('root_path');
        $scope.menu = new MenuItem({
            title: '__sidebar_menu',
            childItems: [{
                title: 'explore',
                iconName: 'explore',
                routeState: 'home',
                position: 0
            }, {
                title: 'home',
                iconName: 'home',
                link: rootPath,
                position: 1
            }, {
                title: 'help',
                iconName: 'help',
                link: rootPath + 'about',
                position: 2
            }]
        });

        // --------------------------------------------------------------------
        // Private members
        // --------------------------------------------------------------------
    }
];
