/* jshint node:true, expr:true */
'use strict';

var _chai = require('chai');
var expect = _chai.expect;

/**
 * Test helper that contains assertions relating to verification of
 * breadcrumbs.
 *
 * @module test.clientUtils.breadCrumbHelper
 */
module.exports = {

    /**
     * Runs tests on the configuration object passed to the bread crumb service,
     * verifying properties of the crumb.
     *
     * @module test.clientUtils.breadCrumbHelper
     * @param {Object} crumb The bread crumb config to verify.
     * @param {Object} props A hash containing different properties
     * 			to test.
     */
    verifyCrumb: function(crumb, props) {
        expect(crumb.title).to.equal(props.title);
        if (typeof props.routeState !== 'undefined') {
            expect(crumb.routeState).to.equal(props.routeState);
        }
        if (typeof props.link !== 'undefined') {
            expect(crumb.link).to.equal(props.link);
        }
    }
};
