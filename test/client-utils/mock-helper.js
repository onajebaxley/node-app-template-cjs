/* jshint node:true, expr:true */
'use strict';

var _clone = require('clone');
var _sinon = require('sinon');

/**
 * Test helper that generates different mocks for client side testing
 *
 * @module test.clientUtils.mockHelper
 */
module.exports = {
    /**
     * Creates and returns a config mock, initialized with the specified
     * config values.
     *
     * @module test.clientUtils.mockHelper
     * @method createConfigMock
     * @param {Object} [config={}] An object representing the config values
     *          populated into the mock.
     */
    createConfigMock: function(config) {
        config = _clone(config);
        if (!config || typeof config !== 'object') {
            config = {};
        };

        var mock = {
            get: function(prop) {
                return mock.__config[prop];
            },
            set: function(prop, value) {
                mock.__config[prop] = value;
            },
            __config: config
        };
        return mock;
    },

    /**
     * Creates and returns a local storage mock that mocks angular
     * local storage's functionality.
     *
     * @module test.clientUtils.mockHelper
     * @method createLocalStorageMock
     * @param {Boolean} [isSupported=false] A boolean object that specifies whether
     *          or not local storage is available.
     * @param {Object} [settings={}] A settings object that represents the backing
     *          local storage store.
     * @return {Object} A mock object for angular-local-storage
     */
    createLocalStorageMock: function(isSupported, settings) {
        isSupported = !!isSupported;
        settings = _clone(settings);
        if (!settings || typeof settings !== 'object') {
            settings = {};
        };

        var mock = {
            isSupported: isSupported,
            get: function(key) {
                return mock.__settings[key];
            },
            set: function(key, value) {
                mock.__settings[key] = value;
            },
            __settings: settings
        };

        return mock;
    },

    /**
     * Creates a mock of the ui router's $state service.
     *
     * @module test.clientUtils.mockHelper
     * @method createUiRouterStateMock
     * @param {String} [url=''] The url that will be returned by the state mock.
     * @return {Object} A mock object for the UI router state
     */
    createUiRouterStateMock: function(url) {
        if (!typeof url !== 'string') {
            url = '';
        }
        var mock = {
            __url: url,
            href: function() {}
        };

        _sinon.stub(mock, 'href', function(state, params) {
            return mock.__url;
        });

        return mock;
    },

    /**
     * Creates a mock of the client side user object
     *
     * @module test.clientUtils.mockHelper
     * @method createUserMock
     * @param {String} [username='jdoe'] The username of the user represented by the mock
     * @param {Array} [roles=[]] An array of roles that the user belongs to
     * @param {Array} [serviceTokens={}] An optional hash of service tokens to associate
     *          with the user object.
     * @param {Object} [properties={}] An optional hash that contains additional properties
     *          for the user object.
     * @return {Object} A mock object for the user
     */
    createUserMock: function(username, roles, serviceTokens, properties) {
        if (!typeof username !== 'string') {
            username = 'jdoe';
        }
        if (!(roles instanceof Array)) {
            roles = [];
        }
        if (!serviceTokens || typeof serviceTokens !== 'object') {
            serviceTokens = {};
        }
        if (!properties || typeof properties !== 'object') {
            properties = {};
        }

        var mock = {
            _isLoggedIn: false,
            _roles: _clone(roles),
            _serviceTokens: _clone(serviceTokens),
            username: _clone(username),
            hasRole: function(role) {
                return mock._roles.indexOf(role.toLowerCase()) >= 0;
            },
            isLoggedIn: function() {
                return mock._isLoggedIn;
            },
            getServiceToken: function(key) {
                return mock._serviceTokens[key];
            }
        };

        for (var prop in properties) {
            mock[prop] = properties[prop];
        }

        return mock;
    },

    /**
     * Creates a mock for angular js' $q service.
     *
     * @module test.clientUtils.mockHelper
     * @method createQMock
     * @return {Object} A mock object for the $q service
     */
    createQMock: function() {
        var mock = function() {};
        mock.__promise = {
            then: _sinon.spy()
        };
        mock.__reject = _sinon.spy();
        mock.__resolve = _sinon.spy();

        mock.defer = function() {
            return {
                promise: mock.__promise,
                reject: mock.__reject,
                resolve: mock.__resolve
            };
        };
        return mock;
    },

    /**
     * Creates a mock for angular js' $resource service.
     *
     * @module test.clientUtils.mockHelper
     * @method createResourceMock
     * @return {Object} A mock object for the $resource service
     */
    createResourceMock: function() {
        var resourceObject = {
            _ret: {
                $promise: {
                    then: _sinon.spy()
                }
            }
        };

        var mock = _sinon.stub().returns(resourceObject);
        mock.__resourceObject = resourceObject;
        mock.__setGetResult = function(error) {
            if (error) {
                resourceObject.get = _sinon.stub().throws(new Error(error));
            } else {
                resourceObject.get = _sinon.stub().returns(resourceObject._ret);
            }
        };
        return mock;
    },

    /**
     * Creates a mock for angular js' $interval service.
     *
     * @module test.clientUtils.mockHelper
     * @method createIntervalMock
     * @return {Object} A mock object for the $interval service
     */
    createIntervalMock: function() {
        var cancelHandle = {};
        var mock = _sinon.stub().returns(cancelHandle);
        mock.cancel = _sinon.spy();

        mock.__cancelHandle = cancelHandle;
        return mock;
    },

    /**
     * Creates a mock for a generic data source object from the app.data module.
     *
     * @module test.clientUtils.mockHelper
     * @method createDataSourceMock
     * @param {String} [errorMessage=undefined] An optional error message if 
     *                  the mock is expected to throw an error when
     *                  fetch() is invoked.
     * @return {Object} A mock object for a data source object
     */
    createDataSourceMock: function(errorMessage) {
        var mock = {
            fetch: function() {},
            _successHandler: null,
            _failureHandler: null
        };

        _sinon.stub(mock, 'fetch', function() {
            if (errorMessage) {
                throw new Error(errorMessage);
            }
            var promise = {
                then: function(successHandler, failureHandler) {
                    mock.__successHandler = successHandler;
                    mock.__failureHandler = failureHandler;
                    return promise;
                }
            };
            return promise;
        });
        return mock;
    },

    /**
     * Creates a mock for a menu item mock from the app.layout module.
     *
     * @module test.clientUtils.mockHelper
     * @method createMenuItemMock
     * @return {Object} A mock object that represents a single menu item
     */
    createMenuItemMock: function() {
        function MenuItem(options) {
            options = options || {};
            this.__canRender = true;
            this.__link = '';

            for (var prop in options) {
                this[prop] = options[prop];
            }

            this.addChildItem = _sinon.spy();
            this.clearChildItems = _sinon.stub();
            this.canRender = _sinon.stub().returns(this.__canRender);
            this.getLink = _sinon.stub().returns(this.__link);
        }

        return MenuItem;
    },

    /**
     * Creates a mock for the bread crumb service from the app.layout module.
     *
     * @module test.clientUtils.mockHelper
     * @method createBreadCrumbMock
     * @return {Object} A mock object that represents the breadcrumb service
     */
    createBreadCrumbMock: function() {
        var mock = {
            __crumbs: [],
            setCrumbs: _sinon.spy(),
            push: _sinon.spy(),
            pop: function() {}
        };
        mock.getCrumbs = _sinon.stub().returns(mock.__crumbs);

        mock.pop = _sinon.stub(mock, 'pop', function() {
            return mock.__crumbs.pop();
        });

        return mock;
    }

};
