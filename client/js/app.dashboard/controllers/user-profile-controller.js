'use strict';

var _clone = require('clone');

/**
 * Controller that can be used for views that allow viewing/managing
 * of user profiles.
 *
 * @module app.dashboard.UserProfileController
 */
module.exports = [ '$scope', 'app.core.user',
    function($scope, user) {

        $scope.username = user.username;
        $scope.firstName = user.firstName;
        $scope.lastName = user.lastName;
        $scope.nickname = user.nickname;
        $scope.picture = user.picture;
        $scope.roles = _clone(user._roles);
        $scope.serviceTokens = _clone(user._serviceTokens);

        $scope.isEditEnabled = false;
        // --------------------------------------------------------------------
        // Initialization code.
        // --------------------------------------------------------------------

        // --------------------------------------------------------------------
        // Private members
        // --------------------------------------------------------------------
    }
];

