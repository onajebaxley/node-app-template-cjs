'use strict';

/**
 * Application level controller - a "global" controller that provides core
 * functionality for the entire page.
 */
module.exports = [ '$scope', 'app.core.config',
    function($scope, config) {

        $scope.username = config.get('username', '');
        $scope.errorMessage = config.get('errorMessage', '');
        $scope.password = '';
    }
];
