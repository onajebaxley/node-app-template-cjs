'use strict';

var _clone = require('clone');
var _screenfull = require('screenfull');

/**
 * Global layout controller for the entire page. Allows child controllers to update
 * layout properties as necessary. Also supports the use of local storage to save
 * certain settings.
 *
 * @module app.auth.LayoutController
 */
module.exports = [ '$scope', 'app.layout.MenuItem', 'app.layout.breadCrumb', 
    function($scope, MenuItem, breadCrumb) {

        breadCrumb.setCrumbs([ {
            title: 'Dashboard',
            routeState: 'explore'
        }, {
            title: 'Explore',
        } ]);
    }
];
