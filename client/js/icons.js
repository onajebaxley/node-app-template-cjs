/**
 * Module that defines icons for the application.
 *
 * Exports an array that includes necessary dependencies, which can then be
 * directly used in an application initialization routine.
 *
 * @module app.icons
 */
'use strict';

var console = require('console');

module.exports = [ '$mdIconProvider', 'app.core.configProvider',
    function($mdIconProvider, configProvider) {
        var rootPath = configProvider.get('root_path', '/');

        $mdIconProvider
            .iconSet('mdi', rootPath + 'css/icons/material-design-icons/mdi.svg')
            .icon('logo', rootPath + 'img/logo.svg')
            .icon('avatar', rootPath + 'img/user.svg');

        console.debug('Icons configured');
    }
];
