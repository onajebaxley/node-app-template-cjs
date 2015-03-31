'use strict';

module.exports = ['$scope', function($scope) {
    $scope.message = {
        name: 'World',
        salutation: 'Mr.',
        greeting: 'Hello'
    };
    $scope.shout = function() {
        var message = $scope.message;
        alert(message.greeting + ', ' +
              message.salutation + ' ' +
              message.name + '!');
    };
}];
