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

module.exports = [ '$mdIconProvider', 'app.SETTINGS',
    function($mdIconProvider, appSettings) {
        var rootPath = appSettings.root_path;
        if(typeof rootPath !== 'string') {
            rootPath = '/';
        }

        $mdIconProvider
            .icon('logo', rootPath + 'img/logo.svg')
            .icon('avatar', rootPath + 'img/user.svg');

        console.debug('Icons configured');
    }
];
