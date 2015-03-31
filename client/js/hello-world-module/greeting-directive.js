'use strict';

module.exports = [
    function() {
        return {
            restrict: 'EA',
            templateUrl: '/js/hello-world-module/greeting.html',
            scope: {
                message: '='
            }
        };
    }
];
