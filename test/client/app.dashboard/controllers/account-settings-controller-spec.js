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

describe('[app.auth.AccountSettingsController]', function() {
    'use strict';

    var controller = null;
    var $httpBackend = null;
    var $rootScope = null;
    var $scope = null;
    var breadCrumbMock = null;
    var MessageBlock = null;

    function _initController(mocks) {
        mocks = mocks || {};

        inject(['$rootScope', '$controller', '$resource', 'app.layout.MessageBlock',
            function(_$rootScope, _$controller, _$resource, _messageBlock) {
                $rootScope = _$rootScope;
                $scope = _$rootScope.$new();
                breadCrumbMock = _mockHelper.createBreadCrumbMock();
                MessageBlock = _messageBlock;

                var options = {
                    $rootScope: _$rootScope,
                    $scope: $scope,
                    $resource: _$resource,
                    'app.core.user': _mockHelper.createUserMock(),
                    'app.core.config': _mockHelper.createConfigMock(),
                    'app.layout.breadCrumb': breadCrumbMock,
                    'app.layout.MessageBlock': MessageBlock
                };

                for (var mockName in mocks) {
                    options[mockName] = mocks[mockName];
                }

                controller = _$controller('app.dashboard.AccountSettingsController', options);
            }
        ]);
    }

    beforeEach(function() {
        controller = null;
        $rootScope = null;
        $scope = null;
        breadCrumbMock = null;
        MessageBlock = null;
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(inject(['$injector', function($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }]));

    describe('[init]', function() {
        it('should expose expected properties and methods', function() {
            _initController();

            expect($scope).to.have.property('settings').and.to.be.a('string');
            expect($scope).to.have.property('asyncInProgress').and.to.be.a('boolean');
            expect($scope).to.have.property('files').and.to.be.an('Array');
            expect($scope).to.have.property('settingsError').and.to.be.an.instanceof(MessageBlock);

            expect($scope).to.have.property('saveSettings').and.to.be.a('function');
            expect($scope).to.have.property('fetchSettings').and.to.be.a('function');
            expect($scope).to.have.property('cancelEdit').and.to.be.a('function');
        });

        describe('[bread crumbs]', function() {
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
                _breadCrumbHelper.verifyCrumb(crumbs[0], { title: 'Dashboard', routeState: 'explore' });
                _breadCrumbHelper.verifyCrumb(crumbs[1], { title: 'Account Settings' });
            });
        });

        describe('[server fetch]', function() {
            var API_URL = 'http://api-server/api';
            var API_KEY = 'some-jwt-key';
            var userMock = null;
            var configMock

            beforeEach(function() {
                userMock = _mockHelper.createUserMock('jdoe', [], {
                    'wc-api': API_KEY
                });
                configMock = _mockHelper.createConfigMock({
                    wc_api_url: API_URL
                });
            });

            afterEach(function() {
                $httpBackend.verifyNoOutstandingRequest();
            });

            it('should automatically fetch settings data from the server on initialization', function() {
                var expectedUrl = API_URL + '/account/metadata'
                $httpBackend.expectGET(expectedUrl, {
                    Authorization: 'bearer ' + API_KEY,
                    Accept: 'application/json'
                }).respond(200, {});

                _initController({
                    'app.core.config': configMock,
                    'app.core.user': userMock
                });

                $httpBackend.flush();
            });

        });
    });

    describe('cancelEdit()', function() {
        beforeEach(function() {
            _initController();
        });

        it('should reset the value of the scope\'s setting object back to the internal settings object', function() {
        });
    });

});
