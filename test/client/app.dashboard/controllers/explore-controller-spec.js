/* jshint expr:true */

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _angular = require('angular');
var _ngMocks = require('angular-mocks');
var _mockHelper = require('../../../client-utils/mock-helper');
var _breadCrumbHelper = require('../../../client-utils/bread-crumb-helper');

var _module = 'app.dashboard';

describe('[app.auth.ExploreController]', function() {
    'use strict';

    var controller = null;
    var $rootScope = null;
    var $scope = null;
    var breadCrumbMock = null;
    var menuItemMock = null;

    function _initController(mocks) {
        mocks = mocks || {};

        inject(['$rootScope', '$controller',
            function(_$rootScope, _$controller) {
                $rootScope = _$rootScope;
                $scope = _$rootScope.$new();
                breadCrumbMock = _mockHelper.createBreadCrumbMock();

                var options = {
                    $rootScope: _$rootScope,
                    $scope: $scope,
                    'app.layout.breadCrumb': breadCrumbMock
                };

                for (var mockName in mocks) {
                    options[mockName] = mocks[mockName];
                }

                controller = _$controller('app.dashboard.ExploreController', options);
            }
        ]);
    }

    beforeEach(function() {
        controller = null;
        $rootScope = null;
        $scope = null;
        breadCrumbMock = null;

        menuItemMock = null;
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('app.core.user', _mockHelper.createUserMock());

        var menuItemMock = _mockHelper.createMenuItemMock();
        $provide.value('app.layout.MenuItem', menuItemMock);
    }]));

    describe('[init]', function() {
        it('should expose expected properties and methods', function() {
            _initController();
        });

        xdescribe('[bread crumbs]', function() {
            beforeEach(function() {
                _initController();
            });

            it('should initialize the bread crumb service when loaded', function() {
                expect(breadCrumbMock.setCrumbs).to.have.been.calledOnce;
                expect(breadCrumbMock.setCrumbs.args[0][0]).to.be.an('Array')
            });

            it('should set the expected breadcrumb values', function() {
                var crumbs = breadCrumbMock.setCrumbs.args[0][0];

                expect(crumbs).to.have.length(2);
                _breadCrumbHelper.verifyCrumb(crumbs[0], {
                    title: 'Dashboard',
                    routeState: 'explore'
                });
                _breadCrumbHelper.verifyCrumb(crumbs[1], {
                    title: 'Explore'
                });
            });
        });
    });

});
