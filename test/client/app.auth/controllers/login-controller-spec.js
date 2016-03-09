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
    var MessageBlock = null;

    function _initController(mocks) {
        mocks = mocks || {};

        inject(['$rootScope', '$controller', 'app.layout.MessageBlock',
            function(_$rootScope, _$controller, _messageBlock) {
                $rootScope = _$rootScope;
                $scope = _$rootScope.$new();
                MessageBlock = _messageBlock;

                var options = {
                    $rootScope: _$rootScope,
                    $scope: $scope,
                    'app.layout.MessageBlock': MessageBlock
                };

                for (var mockName in mocks) {
                    options[mockName] = mocks[mockName];
                }

                controller = _$controller('app.auth.LoginController', options);
            }
        ]);
    }

    beforeEach(function() {
        controller = null;
        $rootScope = null;
        $scope = null;
        MessageBlock = null;
    });

    beforeEach(angular.mock.module(_module));

    describe('[init]', function() {
        it('should expose expected properties and methods', function() {
            _initController();
            expect($scope).to.have.property('username').and.to.equal('');
            expect($scope).to.have.property('password').and.to.equal('');
            expect($scope).to.have.property('loginError').and.to.be.an.instanceof(MessageBlock);
        });

        it('should initialize the username field based on the value specified in the config service', function() {
            var map = {
                username: 'jdoe'
            };
            var mocks = {
                'app.core.config': {
                    get: function(key) {
                        return map[key];
                    }
                }
            };

            _initController(mocks);
            expect($scope.username).to.equal(map.username);
        });

        it('should initialize the loginError field based on the value specified in the config service', function() {
            var map = {
                error_message: 'error message'
            };
            var mocks = {
                'app.core.config': {
                    get: function(key) {
                        return map[key];
                    }
                }
            };

            _initController(mocks);
            expect($scope.loginError.message).to.equal(map.error_message);
            expect($scope.loginError.severity).to.equal('error');
        });
    });
});
