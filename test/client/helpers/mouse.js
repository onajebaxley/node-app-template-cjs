/* jshint node:true */

/**
 * Helper module that simulates mouse actions on a browser. Designed to work
 * with PhantomJS and regular browsers.
 */
'use strict';

module.exports = {
    /**
     * Simulates a click action on a specific element.
     *
     * @param {Element} el The element on whcih the click event will be
     *                     simulated.
     */
    click: function(el) {
        var ev = document.createEvent("MouseEvent");
        ev.initMouseEvent(
            "click",
            true /* bubble */ ,
            true /* cancelable */ ,
            window, null,
            0, 0, 0, 0, /* coordinates */
            false, false, false, false, /* modifier keys */
            0 /*left*/ ,
            null
        );
        el.dispatchEvent(ev);
    }
};
