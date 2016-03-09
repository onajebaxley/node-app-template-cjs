/**
 * Returns a factory that can be used to build DAO objects using $resource,
 * with specific url and api key parameters pre configured.
 */
'use strict';

module.exports = [ '$resource', 'app.core.config', 'app.core.user', function($resource, config, user) {

    function _buildHeaders(sendingData) {
        var header = {
            Authorization: 'bearer ' + user.getServiceToken('api'),
            Accept: 'application/json'
        };
        if(sendingData) {
            header['Content-Type'] = 'application/json';
        }

        return header;
    }

    return {
        /**
         * Builds a standard DAO with CRUD functions.
         *
         * @module app.data.daoFactory
         * @method buildApiDao
         * @param {String} apiPath The API path that the DAO object will query
         * @param {Object} [defaults=undefined] A hash containing default values
         *          of parameters that will be used if the apiPath contains
         *          parameterized tokens.
         * @return {Object} A fully configured $resource object with methods for
         *          CRUD operations.
         */
        buildApiDao: function(apiPath, defaults) {
            if(typeof apiPath !== 'string' || apiPath.length <= 0) {
                throw new Error('Invalid api path specified (arg #1)');
            }
            var baseUrl = config.get('api_url');

            return $resource(baseUrl + apiPath, defaults, {
                fetch: {
                    method: 'GET',
                    headers: _buildHeaders(false),
                    isArray: true
                },
                fetchOne: {
                    method: 'GET',
                    headers: _buildHeaders(false),
                    isArray: false
                },
                fetchList: {
                    method: 'GET',
                    headers: _buildHeaders(false),
                    isArray: true
                },
                save: {
                    method: 'POST',
                    headers: _buildHeaders(true)
                },
                delete: {
                    method: 'DELETE',
                    headers: _buildHeaders(false)
                }
            });
        }
    };

} ];
