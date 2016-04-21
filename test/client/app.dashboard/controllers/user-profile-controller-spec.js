/* jshint expr:true */

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _clone = require('clone');
var _angular = require('angular');
var _ngMocks = require('angular-mocks');
var _mockHelper = require('../../../client-utils/mock-helper');

var _module = 'app.dashboard';

describe('[app.dashboard.UserProfileController]', function() {
    'use strict';

    var controller = null;
    var $rootScope = null;
    var $scope = null;
    var userMock = null;

    function _initController(mocks) {
        mocks = mocks || {};

        inject(['$rootScope', '$controller',
            function(_$rootScope, _$controller) {
                $rootScope = _$rootScope;
                $scope = _$rootScope.$new();

                var options = {
                    $rootScope: _$rootScope,
                    $scope: $scope,
                    'app.core.user': userMock
                };

                for (var mockName in mocks) {
                    options[mockName] = mocks[mockName];
                }

                controller = _$controller('app.dashboard.UserProfileController', options);
            }
        ]);
    }

    beforeEach(function() {
        controller = null;
        $rootScope = null;
        $scope = null;
        userMock = _mockHelper.createUserMock('jdoe', [], {
            'wc-api': 'wc-jwt-token'
        }, {
            firstName: 'John',
            lastName: 'Doe',
            nickname: 'Johnny',
            picture: 'http://pictures/avatar.jpg'
        });
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('app.core.user', userMock);
    }]));

    describe('[init]', function() {
        it('should expose expected properties and methods', function() {
            _initController();

            expect($scope).to.have.property('username').and.to.be.a('string');
            expect($scope).to.have.property('firstName').and.to.be.a('string');
            expect($scope).to.have.property('lastName').and.to.be.a('string');
            expect($scope).to.have.property('nickname').and.to.be.a('string');
            expect($scope).to.have.property('picture').and.to.be.a('string');
            expect($scope).to.have.property('roles').and.to.be.an('Array');
            expect($scope).to.have.property('serviceTokens').and.to.be.an('Object');
            expect($scope).to.have.property('isEditEnabled', false);
        });

        it('should initialize the properties to corresponding values from the user object', function() {
            _initController();

            expect($scope.username).to.equal(userMock.username);
            expect($scope.firstName).to.equal(userMock.firstName);
            expect($scope.lastName).to.equal(userMock.lastName);
            expect($scope.nickname).to.equal(userMock.nickname);
            expect($scope.picture).to.equal(userMock.picture);
            expect($scope.roles).to.deep.equal(userMock._roles);
            expect($scope.serviceTokens).to.deep.equal(userMock._serviceTokens);
        });
    });
});
