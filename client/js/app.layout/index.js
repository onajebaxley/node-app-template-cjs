'use strict';

var console = require('console');
var angular = require('angular');
var localStorage = require('angular-local-storage');

/**
 * Layout module for the application. Provides layout related functionality
 * across the application.
 * 
 * The components defined by this module may be extended and/or augmented 
 * as necessary.
 */
var moduleName = 'app.layout';
angular.module(moduleName, [ 'LocalStorageModule', 'app.core' ])
    .controller('app.layout.LayoutController', require('./controllers/layout-controller'))
    ;

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
