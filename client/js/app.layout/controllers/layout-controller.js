'use strict';

var _clone = require('clone');
var _screenfull = require('screenfull');

/**
 * Global layout controller for the entire page. Allows child controllers to update
 * layout properties as necessary. Also supports the use of local storage to save
 * certain settings.
 *
 * @module app.layout.LayoutController
 */
module.exports = [ '$scope', '$rootScope', '$window', '$state',
                    'localStorageService', 'app.core.config', 'app.core.user',
                    'app.core.utils', 'app.layout.breadCrumb',
    function($scope, $rootScope, $window, $state, localStorage,
             config, user, utils, breadCrumb) {

        //Note: This is a hack to enable testing of fullscreen toggle functionality.
        $scope.__screenfull_wrapper = _screenfull;

        $scope._user = user;
        $scope._breadCrumb = breadCrumb;

        var layoutConfig = utils.applyDefaultIfNotObject(config.get('layout'), {});
        $scope._layout = _clone(layoutConfig);

        // Default properties required by the controller
        $scope._layout.isFullScreen = !!$scope._layout.isFullScreen;
        $scope._layout.stateTransitionInProgress = !!$scope._layout.stateTransitionInProgress;

        _restoreLocalStorageSettings();

        /**
         * Sets a layout property to the specified value. The utlimate result of
         * this action is not specified by the controller, and left to the
         * developer.
         *
         * One way to use this method would be to bind the property to a UI
         * element or directive, resulting in a DOM change when the property
         * changes value.
         *
         * @module app.layout.LayoutController
         * @method setLayoutProperty
         * @param {String} property The property to be set
         * @param {Object} value The value to set to the property
         * @param {Boolean} [persist=false] If set to true, persists the current
         *          setting in local storage.
         */
        $scope.setLayoutProperty = function(property, value, persist) {
            persist = !!persist;
            if(typeof property !== 'string' || property.length <= 0) {
                throw new Error('Invalid layout property specified (arg #1)');
            }
            var result = _lookupProperty($scope._layout, property);
            result.parent[result.propertyName] = value;

            if(persist && localStorage.isSupported) {
                var storageKey = '_layout.' + property;
                localStorage.set(storageKey, result.parent[result.propertyName]);
            }
        };

        /**
         * Toggles a layout property. This will convert truthy or falsy values
         * into true or false boolean values. The utlimate result of this
         * action is not specified by the controller, and left to the
         * developer.
         *
         * One way to use this method would be to bind the property to a UI
         * element or directive, resulting in a DOM change when the property
         * changes value.
         *
         * @module app.layout.LayoutController
         * @method toggleLayoutProperty
         * @param {String} property The property to be toggled.
         * @param {Boolean} [persist=false] If set to true, persists the current
         *          setting in local storage.
         */
        $scope.toggleLayoutProperty = function(property, persist) {
            persist = !!persist;
            if(typeof property !== 'string' || property.length <= 0) {
                throw new Error('Invalid layout property specified (arg #1)');
            }
            var result = _lookupProperty($scope._layout, property);
            result.parent[result.propertyName] = !result.parent[result.propertyName];
            if(persist && localStorage.isSupported) {
                var storageKey = '_layout.' + property;
                localStorage.set(storageKey, result.parent[result.propertyName]);
            }
        };

        /**
         * Toggles fullscreen mode on the page. In addition to toggling
         * fullscreen mode a scope variable is also updated
         * (_layout.isFullScreen), and can be used to display appropriate
         * visual cues for the user.
         *
         * @module app.layout.LayoutController
         * @method toggleFullScreen
         */
        $scope.toggleFullScreen = function() {
            if($scope.__screenfull_wrapper.enabled) {
                $scope.__screenfull_wrapper.toggle();
                $scope._layout.isFullScreen = !$scope._layout.isFullScreen;
            }
        };

        /**
         * Uses the window history go navigate to the previous page. Calling this
         * function is the equivalent of pressing the browser's back button.
         *
         * @module app.layout.LayoutController
         * @method goBack
         */
        $scope.goBack = function() {
            $window.history.back();
        };

        // --------------------------------------------------------------------
        // Event handlers
        // --------------------------------------------------------------------
        $rootScope.$on('$stateChangeStart', function() {
            $scope._layout.stateTransitionInProgress = true;
        });

        $rootScope.$on('$stateChangeSuccess', function() {
            $scope._layout.stateTransitionInProgress = false;
        });
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            $scope._layout.stateTransitionInProgress = false;
            $state.go('error');
        });
        // --------------------------------------------------------------------
        // Private members
        // --------------------------------------------------------------------
        function _default(value, defaultValue) {
            if(typeof value === 'undefined') {
                return defaultValue;
            } else if(value instanceof Array) {
                return _clone(value);
            }
            return value;
        }

        function _restoreLocalStorageSettings() {
            if(!localStorage.isSupported) {
                return;
            }

            function _applySetting(propPrefix, scopeObj) {
                for(var propName in scopeObj) {
                    var storageKey = propPrefix + '.' + propName;

                    var value = scopeObj[propName];
                    if(!(value instanceof Array) &&
                       value && typeof value === 'object') {
                        _applySetting(storageKey, value);
                    } else {
                        scopeObj[propName] = _default(localStorage.get(storageKey),
                                                      scopeObj[propName]);
                    }
                }
            }

            _applySetting('_layout', $scope._layout);
        }

        function _lookupProperty(map, property) {
            var tokens = property.split('.');

            var result = {
                parent: map,
                propertyName: null,
                value: map
            };
            for(var index=0; index<tokens.length; index++) {
                var token = tokens[index];
                if(result.value.hasOwnProperty(token)) {
                    result.propertyName = token;
                    result.parent = result.value;
                    result.value = result.value[token];
                } else {
                    throw new Error('Specified layout property is not supported: ' + property);
                }
            }

            return result;
        }
    }
];
