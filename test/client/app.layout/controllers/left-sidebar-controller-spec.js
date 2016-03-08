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

var _module = 'app.layout';

describe('[app.auth.LeftSidebarController]', function() {
    'use strict';

    var controller = null;
    var $rootScope = null;
    var $scope = null;
    var MenuItem = null;

    function _initController(mocks) {
        mocks = mocks || {};

        inject(['$rootScope', '$controller', 'app.layout.MenuItem',
            function(_$rootScope, _$controller, _MenuItem) {
                $rootScope = _$rootScope;
                $scope = _$rootScope.$new();
                MenuItem = _MenuItem;

                var options = {
                    $rootScope: _$rootScope,
                    $scope: $scope,
                    'app.layout.MenuItem': MenuItem
                };

                for (var mockName in mocks) {
                    options[mockName] = mocks[mockName];
                }

                controller = _$controller('app.layout.LeftSidebarController', options);
            }
        ]);
    }

    beforeEach(function() {
        controller = null;
        $rootScope = null;
        $scope = null;
        MenuItem = null;
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('app.core.user', _mockHelper.createUserMock());
    }]));

    describe('[init]', function() {
        it('should expose expected properties and methods', function() {
            _initController();
            expect($scope).to.have.property('menu').and.to.be.an('object');
            expect($scope.menu).to.be.an.instanceof(MenuItem);
        });

        it('should define the required menu items', function() {
            var rootPath = '/foo/bar';
            var configMock = _mockHelper.createConfigMock({
                root_path: rootPath
            });
            var expectedItems = [{
                title: 'explore',
                iconName: 'explore',
                routeState: 'explore',
                position: 0
            }, {
                title: 'home',
                iconName: 'home',
                link: rootPath,
                position: 1
            }, {
                title: 'help',
                iconName: 'help',
                link: rootPath + 'about',
                position: 2
            }];

            function checkMenuItemProperties(item, expectedItem) {
                expect(item.position).to.equal(expectedItem.position);
                expect(item.title).to.equal(expectedItem.title);
                expect(item.iconName).to.equal(expectedItem.iconName);
                if(expectedItem.routeState) {
                    expect(item.routeState).to.equal(expectedItem.routeState);
                } else {
                    expect(item.link).to.equal(expectedItem.link);
                }
            }

            _initController({
                'app.core.config': configMock
            });

            expect($scope.menu.childItems).to.have.length(3);
            for(var index=0; index<expectedItems.length; index++) {
                checkMenuItemProperties($scope.menu.childItems[index], expectedItems[index]);
            }
        });
    });

});
