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

describe('[app.auth.HomeController]', function() {
    'use strict';

    var controller = null;
    var $rootScope = null;
    var $scope = null;

    function _initController(mocks) {
        mocks = mocks || {};

        inject(['$rootScope', '$controller',
            function(_$rootScope, _$controller) {
                $rootScope = _$rootScope;
                $scope = _$rootScope.$new();

                var options = {
                    $rootScope: _$rootScope,
                    $scope: $scope
                };

                for (var mockName in mocks) {
                    options[mockName] = mocks[mockName];
                }

                controller = _$controller('app.dashboard.HomeController', options);
            }
        ]);
    }

    beforeEach(function() {
        controller = null;
        $rootScope = null;
        $scope = null;
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('app.core.user', _mockHelper.createUserMock());
    }]));

    describe('[init]', function() {
        it('should expose expected properties and methods', function() {
            _initController();
        });
    });

});
