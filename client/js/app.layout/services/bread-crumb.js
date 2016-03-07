/**
 * Returns a factory that can be used to set and retrieve a breadcrumb chain.
 * This factory is primarily intended to allow inter module/controller
 * communication.
 */
'use strict';

var _clone = require('clone');

module.exports = [ 'app.layout.MenuItem', function(MenuItem) {
    var _crumbs = [];

    function _addCrumb(crumb) {
        if(typeof crumb === 'string') {
            crumb = new MenuItem({
                title: crumb
            });
        } else if(crumb && !(crumb instanceof Array) && typeof crumb === 'object') {
            crumb = new MenuItem(crumb);
        } else {
            throw new Error('Invalid crumb. Crumb should be specified as either a string or an object');
        }
        _crumbs.push(crumb);
    }

    return {
        /**
         * Gets the breadcumb tokens.
         *
         * @module app.layout.breadCrumb
         * @method getCrumbs
         * @return {Array} An array of string tokens that represent the
         *          bread crumbs.
         */
        getCrumbs: function() {
            return _crumbs;
        },

        /**
         * Sets breadcrumb tokens.
         *
         * @module app.layout.breadCrumb
         * @method setCrumbs
         * @param {Array} crumbs An array of string tokens that represent the
         *          bread crumbs.
         */
        setCrumbs: function(crumbs) {
            if(!crumbs || !(crumbs instanceof Array)) {
                throw new Error('Invalid crumbs specified (arg #1)');
            }

            _crumbs.splice(0);

            for(var index=0; index<crumbs.length; index++) {
                _addCrumb(crumbs[index]);
            }
        },

        /**
         * Pushes a token to the end of bread crumb chain.
         *
         * @module app.layout.breadCrumb
         * @method push
         * @param {String/Object} crumb A string/object that represents the
         *          crumb to push. This can be a string, or an object wich
         *          includes title and url/ui route information.
         */
        push: function(crumb) {
            _addCrumb(crumb);
        },

        /**
         * Pops the final crumb off the top of the breadcrumb.
         *
         * @module app.layout.breadCrumb
         * @method pop
         * @return {String/Object} A string/object that represents the topmost
         *          crumb that was just popped.
         */
        pop: function() {
            return _crumbs.pop();
        }
    };

} ];
