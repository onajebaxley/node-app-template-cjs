'use strict';

var _clone = require('clone');
var _screenfull = require('screenfull');

/**
 * Global layout controller for the entire page. Allows child controllers to
 * update layout properties as necessary. Also supports the use of local
 * storage to save certain settings.
 *
 * @module app.dashboard.AccountSettingsController
 */
module.exports = [ '$scope', '$resource', 'app.layout.breadCrumb',
                    'app.layout.MessageBlock',
    function($scope, $resource, breadCrumb, MessageBlock) {

        var _settings = null;

        breadCrumb.setCrumbs([ {
            title: 'Dashboard',
            routeState: 'explore'
        }, {
            title: 'Account Settings',
        } ]);

        $scope.settings = '';
        $scope.files = [];
        $scope.asyncInProgress = true;
        $scope.settingsError = new MessageBlock();

        setTimeout(function() {
            $scope.asyncInProgress = false;
            $scope.$digest();
        }, 1000);


        /**
         * Cancels an ongoing edit operation, and restores the settings
         * variable to the local settings reference.
         *
         * @module app.layout.LayoutController
         * @method cancelEdit
         */
        $scope.cancelEdit = function() {
        };

        /**
         * Attempts to download settings from the cloud and update the
         * settings string on the scope.
         *
         * @module app.layout.LayoutController
         * @method fetchSettings
         */
        $scope.fetchSettings = function() {
        };

        /**
         * Attempts to parse and save user settings to the cloud. No action
         * will be taken if the parse operation fails.
         *
         * @module app.layout.LayoutController
         * @method saveSettings
         */
        $scope.saveSettings = function() {
            var settings = _tryParseSettings();
            if(settings) {
                //TODO: Save to cloud.
            }
        };

        // --------------------------------------------------------------------
        // Private members
        // --------------------------------------------------------------------
        function _tryParseSettings() {
            try {
                return JSON.parse($scope.settings);
            } catch(ex) {
                console.log(ex);
                $scope.settingsError.error('Invalid JSON: ' + ex.toString());
            }
        }

        function _updateSettings(settings) {
            _settings = settings;
            $scope.settings = JSON.stringify(_settings, null, 2);
        }
    }
];
