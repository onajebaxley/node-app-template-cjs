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
     * @module app.data.RestDataSource
     * @class RestDataSource
     * @constructor
     */
    function RestDataSource() {
        this._dataSource = null;
    }

    /**
     * Allows the data source to be configured prior to a fetch operation.
     *
     * @module app.data.RestDataSource
     * @class RestDataSource
     * @method configure
     * @param {Object} configOptions Configuration options for the resource.
     *                  This object should contain the following three properties,
     *                  all of which will be passed to AngularJS' $resource
     *                  service. More information about these properties can be
     *                  found here: https://docs.angularjs.org/api/ngResource/service/$resource.
     *                      - url: The Url of the resource
     *                      - paramDefaults: Default parameter values
     *                      - actions: Actions supported by the data source
     */
    RestDataSource.prototype.configure = function(configOptions) {
        if(!configOptions || typeof configOptions !== 'object') {
            throw new Error('Invalid configuration options specified (arg #1)');
        }
        if(typeof configOptions.url !== 'string' || configOptions.url.length <= 0) {
            throw new Error('Configuration options does not define a valid url property (configOptions.url)');
        }
        this._dataSource = $resource(configOptions.url,
                                           configOptions.paramDefaults,
                                           configOptions.actions);
    };

    /**
     * Executes a data fetch from the server. This will invoke the GET action on
     * the underlying $resource object.
     *
     * @module app.data.RestDataSource
     * @class RestDataSource
     * @method serverFetch
     * @return {Object} A promise that will be rejected or resolved based on the outcome
     *              of the fetch operation.
     */
    RestDataSource.prototype.serverFetch = function() {
        if(!this._dataSource) {
            throw new Error('Cannot perform operation - the data source has not been configured');
        }
        var def = $q.defer();
        try  {
            this._dataSource.get().$promise.then(function(data) {
                def.resolve(data);
            }, function(err) {
                def.reject(err);
            });
        } catch(ex) {
            def.reject(ex);
        }
        return def.promise;
    };

    return RestDataSource;
} ];
