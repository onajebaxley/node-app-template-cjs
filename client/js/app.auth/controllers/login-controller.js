'use strict';

/**
 * Controller for the login page - provides basic functionality required for
 * the login page functionality.
 *
 * @module app.auth.LoginController
 */
module.exports = [ '$scope', 'app.core.config', 'app.layout.MessageBlock',
    function($scope, config, MessageBlock) {

        $scope.username = config.get('username', '');
        $scope.loginError = new MessageBlock();
        $scope.loginError.error(config.get('error_message', ''));
        $scope.password = '';
    }
];
