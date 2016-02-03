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

var _module = 'app.auth';

describe('[app.auth.LoginController]', function() {
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

                controller = _$controller('app.auth.LoginController', {
                    $rootScope: _$rootScope,
                    $scope: $scope
                });
            }
        ]);
    }

    beforeEach(function() {
        controller = null;
        $rootScope = null;
        $scope = null;
    });

    beforeEach(angular.mock.module(_module));

    describe('[init]', function() {
        it('should expose expected properties and methods', function() {
            _initController();
        });
    });
});
