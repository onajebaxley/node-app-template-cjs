'use strict';

/**
 * Returns a rest data source type that represents a data access object for
 * REST data sources. This is a simple wrapper around AngularJS' $resource
 * object, designed to work individually, or in conjunction with a poller
 * object.
 */
module.exports = [ '$resource', '$q', function($resource, $q) {

    /**
     * A basic data source object for REST services. Functions as a thin wrapper
     * around angular's $resource service, and exposes a standard API that allows
     * for easy interaction with the overal data fetch architecture.
     *
     * @module app.data
     * @class RestDataSource
     * @constructor
     */
    function RestDataSource() {
    }

    return RestDataSource;
} ];
