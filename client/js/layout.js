/**
 * Module that configures layout related settings for the application.
 *
 * Exports an array that includes necessary dependencies, which can then be
 * directly used in an application initialization routine.
 *
 * @module app.layout
 */
'use strict';

var console = require('console');

module.exports = [ 'app.core.configProvider',
    function(configProvider) {
        configProvider.set('layout', {
            leftSidebar: {
                isPinned: false,
                isExpanded: false,
                isOpen: false
            }
        });
        console.debug('Layout configured');
    }
];
