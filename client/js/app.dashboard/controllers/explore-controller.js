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
module.exports = [ '$scope', 'app.layout.MenuItem',
    function($scope, MenuItem) {
    }
];
