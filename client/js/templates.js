/**
 * Placeholder template module. This module will be overwritten during build
 * time, and will contain compiled angular js templates.
 */
'use strict';

var angular = require('angular');

var moduleName = 'templates';
angular.module(moduleName, [])
    .run([ '$templateCache', function($templateCache) {
        // **Do not** place any code here. This file will be overwritten during
        // compilation.
    }]);

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
