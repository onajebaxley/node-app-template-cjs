'use strict';

var angular = require('angular');
var console = require('console');


var moduleName = 'helloWorldModule';
angular.module(moduleName, [])
    .controller('GreetingController', require('./greeting-controller'))
    .directive('greetingDirective', require('./greeting-directive'))

console.debug('Module loaded: [' + moduleName + ']');
module.exports = moduleName;
