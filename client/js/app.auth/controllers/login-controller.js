'use strict';

/**
 * Controller for the login page - provides basic functionality required for
 * the login page functionality.
 *
 * @module app.auth.LoginController
 */
module.exports = [ '$scope', 'app.core.config',
    function($scope, config) {

        $scope.username = config.get('username', '');
        $scope.errorMessage = config.get('error_message', '');
        $scope.password = '';
    }
];
