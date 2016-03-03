'use strict';

var _clone = require('clone');

/**
 * Returns a menu type that represents a single menu item with zero or more
 * child menu items associated with it. Each menu item has support for multiple
 * targets (urls, ui router states, etc), icons, and permissions based
 * rendering.
 */
module.exports = [ '$state', 'app.core.user', 'app.core.utils', function($state, user, utils) {

     /**
      * Represents a single menu item that can be a part of a hierarchical system
      * of menus. The menu options must include a title property, but all other
      * properties are optional. Supported options include:
      *
      *  - title: The menu title
      *  - position: The position of the menu item (defaults to 0) 
      *  - routeState: The state value of the link (if ui router is being used). Defaults to ''
      *  - routeParams: Parameters used to generate the ui route. Defaults to {}
      *  - link: A hyperlink to a resource (non ui router). Defaults to '#'
      *  - fontSet: The font set to use when rendering a font based svg icon. Defaults to 'angular-material'
      *  - iconName: The name of the svg icon to use
      *  - roles: An array of roles for which the menu will be displayed. Defaults to ['*']
      *
      * @module app.core.MenuItem
      * @class MenuItem
      * @constructor
      * @constructor 
      * @param {Object} menuOptions An options object that describes the
      *              menu
      */
    function MenuItem(options) {
        if(!options || options instanceof Array || typeof options !== 'object') {
            throw new Error('Invalid menu options specified (arg #1)');
        }

        if(typeof options.title !== 'string' || options.title.length <= 0) {
            throw new Error('Menu options does not define a valid title property (menuOptions.title)');
        }

        this.title = options.title;
        this.position = utils.applyDefaultIfNotNumber(options.position, 0, true);
        this.routeState = utils.applyDefaultIfNotString(options.routeState, '', true);
        this.routeParams = utils.applyDefaultIfNotObject(options.routeParams, {});
        this.link = utils.applyDefaultIfNotString(options.link, '#');
        this.fontSet = utils.applyDefaultIfNotString(options.fontSet, 'angular-material');
        this.iconName = utils.applyDefaultIfNotString(options.iconName, '');
        this.roles = utils.applyDefaultIfNotArray(options.roles, [ '*' ]);
        this.childItems = [];

        if(options.childItems instanceof Array) {
            for(var index = 0; index<options.childItems.length; index++) {
                var childOptions = options.childItems[index];
                var childMenu = this.addChildItem(childOptions);
            }
        }
    }

    /**
     * Adds a child item to the current menu item.
     *
     * @module app.core.MenuItem
     * @class MenuItem
     * @method addChildItem
     * @param {Object} item A hash that defines the menu item, or a previously
     *          defined menu item object. If a hash is specified, a new menu item
     *          will be created using the hash.
     * @return {Object} A reference to the newly added menu item.
     */
    MenuItem.prototype.addChildItem = function(item) {
        if(!(item instanceof MenuItem)) {
            item = new MenuItem(item);
        }
        this.childItems.push(item);
        return item;
    };

    /**
     * Clears all child items from the current menu item.
     *
     * @module app.core.MenuItem
     * @class MenuItem
     * @method clearChildItems
     */
    MenuItem.prototype.clearChildItems = function() {
        this.childItems.splice(0, this.childItems.length);
    };

    /**
     * Determines whether or not the menu item can be rendered for the current
     * user.
     * 
     * @module app.core.MenuItem
     * @class MenuItem
     * @method canRender
     * @return {Boolean} True if the item can be shown to the user, false
     *              otherwise.
     */
    MenuItem.prototype.canRender = function() {
        if(this.roles.indexOf('*') >= 0) {
            return true;
        }
        if(!user.isLoggedIn()) {
            return false;
        }
        console.log(user._roles);
        for(var index=0; index<this.roles.length; index++) {
            console.log(this.roles[index]);
            if(user.hasRole(this.roles[index])) {
                return true;
            }
        }
        return false;
    };

    /**
     * Returns a link that can be used when rendering the menu item. This method
     * leverages ui route information if specified, and if not, defaults to the
     * link value of the item.
     *
     * @module app.core.MenuItem
     * @class MenuItem
     * @method getLink
     * @return {String} A string hyperlink that can be used when rendering the
     *          menu item.
     */
    MenuItem.prototype.getLink = function() {
        if (typeof this.routeState === 'string' &&
                            this.routeState.length > 0) {
            return $state.href(this.routeState, this.routeParams);
        }
        return this.link;
    };

    return MenuItem;
} ];
