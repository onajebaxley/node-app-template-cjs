'use strict';

var _clone = require('clone');
var _screenfull = require('screenfull');

/**
 * Global layout controller for the entire page. Allows child controllers to update
 * layout properties as necessary. Also supports the use of local storage to save
 * certain settings.
 *
 * @module app.dashboard.AccountSettingsController
 */
module.exports = [ '$scope', '$resource', 'app.layout.breadCrumb',
    function($scope, $resource, breadCrumb) {

        breadCrumb.setCrumbs([ {
            title: 'Dashboard',
            routeState: 'explore'
        }, {
            title: 'Account Settings',
        } ]);

        $scope.settings = JSON.stringify({
            locations: [ {
                id: 1,
                title: '1 broadway',
                areas: [ {
                    id: 1,
                    title: 'floor 3',
                    maps: [ {
                        main: 'map_3'
                    } ]
                }, {
                    id: 2,
                    title: 'floor 4',
                    maps: [ {
                        main: 'map_4'
                    } ]
                } ]
            } ]
        }, null, 2);
        $scope.files = [];
        $scope.asyncInProgress = true;
        $scope.errorMessage = '';

        setTimeout(function() {
            $scope.asyncInProgress = false;
            $scope.$digest();
        }, 5000);

        $scope.fetchSettings = function() {
        };

        $scope.verifySettings = function() {
        };

        $scope.saveSettings = function() {
        };
    }
];
