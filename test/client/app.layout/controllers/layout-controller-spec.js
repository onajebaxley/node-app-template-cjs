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

describe('[app.layout.LayoutController]', function() {
    'use strict';

    var controller = null;
    var $rootScope = null;
    var $scope = null;
    var userMock = null;
    var $stateMock = null;
    var DEFAULT_PROPERTIES = ['isFullScreen', 'stateTransitionInProgress'];

    function _getConfigMock(layoutConfig) {
        layoutConfig = layoutConfig || {
            name: 'test-app',
            description: 'test application',
            firstGroup: {
                foo: 'bar',
                abc: 123,
                list: [1, 2, 3],
                nestedGroup: {
                    nested: 'child',
                    boolProp: true
                }
            },
            secondGroup: {
                bar: 'baz',
                yet: 'another'
            }
        };

        layoutConfig.isFullScreen = !!layoutConfig.isFullScreen;
        layoutConfig.stateTransitionInProgress = !!layoutConfig.stateTransitionInProgress;

        return _mockHelper.createConfigMock({
            layout: layoutConfig
        });
    }

    function _flatten(map, prefix) {
        prefix = prefix || '';
        var list = [];
        for (var propName in map) {
            var value = map[propName]
            var fullPropName = (prefix !== '') ? prefix + '.' + propName : propName;

            if (!(value instanceof Array) && value && typeof value === 'object') {
                var childList = _flatten(value, fullPropName)
                list = list.concat(childList);
            } else {
                list.push({
                    name: fullPropName,
                    value: value
                });
            }
        }

        return list;
    }

    function _getPropertyValue(map, property) {
        var tokens = property.split('.');
        var value = map;
        for (var index = 0; index < tokens.length; index++) {
            var token = tokens[index];
            if (value.hasOwnProperty(token)) {
                value = value[tokens[index]];
            } else {
                value = undefined;
                break;
            }
        }
        return value;
    }


    function _initController(mocks) {
        mocks = mocks || {};

        inject(['$rootScope', '$controller',
            function(_$rootScope, _$controller) {
                $rootScope = _$rootScope;
                $scope = _$rootScope.$new();
                userMock = _mockHelper.createUserMock();
                $stateMock = _mockHelper.createUiRouterStateMock();

                var options = {
                    $rootScope: _$rootScope,
                    $scope: $scope,
                    localStorageService: _mockHelper.createLocalStorageMock(false, {}),
                    'app.core.user': userMock,
                    '$state': $stateMock
                };

                for (var mockName in mocks) {
                    options[mockName] = mocks[mockName];
                }

                controller = _$controller('app.layout.LayoutController', options);
            }
        ]);
    }

    beforeEach(function() {
        controller = null;
        $rootScope = null;
        $scope = null;
        $stateMock = null;
        userMock = null;
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('app.core.user', _mockHelper.createUserMock());
    }]));

    describe('[init]', function() {
        it('should expose expected properties and methods', function() {
            _initController();
            expect($scope).to.have.property('_layout').and.to.be.an('object');
            expect($scope).to.have.property('_user').and.to.be.an('object');
            expect($scope).to.have.property('_breadCrumb').and.to.be.an('object');
            expect($scope).to.have.property('setLayoutProperty').and.to.be.a('function');
            expect($scope).to.have.property('toggleLayoutProperty').and.to.be.a('function');
            expect($scope).to.have.property('toggleFullScreen').and.to.be.a('function');
            expect($scope).to.have.property('goBack').and.to.be.a('function');

            expect($scope._user).to.equal(userMock);
        });

        it('should use settings specified via the config module to populate layout property values', function() {
            var configMock = _getConfigMock();

            _initController({
                'app.core.config': configMock
            });
            expect($scope._layout).to.deep.equal(configMock.get('layout'));
        });

        it('should define a layout object with default properties if the config module does not specify any defaults', function() {
            var configMock = _getConfigMock({});

            _initController({
                'app.core.config': configMock
            });
            expect($scope._layout).to.be.an('object');
            expect($scope._layout).to.have.property('isFullScreen').and.to.be.a('boolean');
        });

        it('should restore settings values from local storage if available', function() {
            var configMock = _getConfigMock();
            var expectedSettings = {
                '_layout.name': 'new name',
                '_layout.description': 'new description',

                '_layout.firstGroup.foo': 'not bar',
                '_layout.firstGroup.abc': 456,
                '_layout.firstGroup.list': [4, 5, 6],
                '_layout.firstGroup.nestedGroup.nested': 'different child',
                '_layout.firstGroup.nestedGroup.boolProp': false,

                '_layout.secondGroup.bar': 'not baz',
                '_layout.secondGroup.yet': 'something else',

                '_layout.doesNotExist': 'does not exist'
            };
            var localStorageMock = _mockHelper.createLocalStorageMock(true, expectedSettings);

            _initController({
                'app.core.config': configMock,
                localStorageService: localStorageMock
            });

            expect($scope._layout.firstGroup.foo).to.equal(expectedSettings['_layout.firstGroup.foo']);
            expect($scope._layout.firstGroup.abc).to.equal(expectedSettings['_layout.firstGroup.abc']);
            expect($scope._layout.firstGroup.list).to.deep.equal(expectedSettings['_layout.firstGroup.list']);
            expect($scope._layout.firstGroup.nestedGroup.nested).to.equal(expectedSettings['_layout.firstGroup.nestedGroup.nested']);
            expect($scope._layout.firstGroup.nestedGroup.boolProp).to.equal(expectedSettings['_layout.firstGroup.nestedGroup.boolProp']);

            expect($scope._layout.secondGroup.bar).to.equal(expectedSettings['_layout.secondGroup.bar']);
            expect($scope._layout.secondGroup.yet).to.equal(expectedSettings['_layout.secondGroup.yet']);

            // Make sure that additional local stroage properties are not added to the scope.
            expect($scope._layout).to.not.have.property('_layout.doesNotExist');
        });

        it('should not attempt to restore values from local storage if local storage is not supported', function() {
            var configMock = _getConfigMock();
            var expectedSettings = {
                '_layout.name': 'new name',
                '_layout.description': 'new description',

                '_layout.firstGroup.foo': 'not bar',
                '_layout.firstGroup.abc': 456,
                '_layout.firstGroup.list': [4, 5, 6],
                '_layout.firstGroup.nestedGroup.nested': 'different child',
                '_layout.firstGroup.nestedGroup.boolProp': false,

                '_layout.secondGroup.bar': 'not baz',
                '_layout.secondGroup.yet': 'something else',

                '_layout.doesNotExist': 'does not exist'
            };

            var localStorageMock = _mockHelper.createLocalStorageMock(false, expectedSettings);
            _initController({
                'app.core.config': configMock,
                localStorageService: localStorageMock
            });

            expect($scope._layout).to.deep.equal(configMock.get('layout'));
        });
    });

    describe('setLayoutProperty()', function() {
        it('should throw an error if invoked with an invalid layout property', function() {
            var error = 'Invalid layout property specified (arg #1)';

            function invokeMethod(property) {
                return function() {
                    return $scope.setLayoutProperty(property);
                };
            }

            _initController();

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the layout property specified was not initialized via application config', function() {
            function testInvocation(property) {
                var error = 'Specified layout property is not supported: ' + property;
                var methodInvocation = function() {
                    return $scope.setLayoutProperty(property);
                };

                expect(methodInvocation).to.throw(error);
            }

            _initController();

            testInvocation('bad-property-1');
            testInvocation('foobar');
            testInvocation('   ');
        });

        it('should not throw an error if the layout property specified was initialized via application config', function() {
            function testInvocation(property) {
                var methodInvocation = function() {
                    return $scope.setLayoutProperty(property);
                };

                expect(methodInvocation).to.not.throw();
            }
            var configMock = _getConfigMock();
            _initController({
                'app.core.config': configMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name);
            }
        });

        it('should update the property value to the specified value when a valid property is specified', function() {
            function testInvocation(property, value) {
                $scope.setLayoutProperty(property, value);

                var newValue = _getPropertyValue($scope._layout, property);
                expect(newValue).to.equal(value);
            }
            var configMock = _getConfigMock({
                layout: {
                    first: 'abc',
                    second: '123',
                    third: true,
                    child: {
                        first: false,
                        second: {},
                        third: function() {}
                    }
                }
            });
            _initController({
                'app.core.config': configMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name, item.name + ':' + item.value.toString());
            }
        });

        it('should persist values to local storage if the persist flag is set to true', function() {
            var localStorageMock = _mockHelper.createLocalStorageMock(true);
            var localStorageSpy = _sinon.stub(localStorageMock, 'set');

            function testInvocation(property, value) {
                localStorageSpy.reset();

                expect(localStorageSpy).to.not.have.been.called;

                $scope.setLayoutProperty(property, value, true);

                var newValue = _getPropertyValue($scope._layout, property);
                expect(localStorageSpy).to.have.been.calledOnce;
                expect(localStorageSpy).to.have.been.calledWith('_layout.' + property, value);
            }
            var configMock = _getConfigMock();
            _initController({
                'app.core.config': configMock,
                localStorageService: localStorageMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name, item.name + ':' + item.value.toString());
            }
        });

        it('should not persist values to a local storage if the persist flag is omitted or set to false', function() {
            var localStorageMock = _mockHelper.createLocalStorageMock(true);
            var localStorageSpy = _sinon.spy(localStorageMock, 'set');

            function testInvocation(property, value, flag) {
                localStorageSpy.reset();

                expect(localStorageSpy).to.not.have.been.called;

                $scope.setLayoutProperty(property, value, flag);

                var newValue = _getPropertyValue($scope._layout, property);
                expect(localStorageSpy).to.not.have.been.called;
            }
            var configMock = _getConfigMock();
            _initController({
                'app.core.config': configMock,
                localStorageService: localStorageMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name, item.name + ':' + item.value.toString());
                testInvocation(item.name, item.name + ':' + item.value.toString(), false);
            }
        });

        it('should not persist values to local storage if the persist flag is set to true, but local storage is not supported', function() {
            var localStorageMock = _mockHelper.createLocalStorageMock(false);
            var localStorageSpy = _sinon.stub(localStorageMock, 'set');

            function testInvocation(property, value) {
                localStorageSpy.reset();

                expect(localStorageSpy).to.not.have.been.called;

                $scope.setLayoutProperty(property, value, true);

                var newValue = _getPropertyValue($scope._layout, property);
                expect(localStorageSpy).to.not.have.been.called;
            }
            var configMock = _getConfigMock();
            _initController({
                'app.core.config': configMock,
                localStorageService: localStorageMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name, item.name + ':' + item.value.toString());
            }
        });
    });

    describe('toggleLayoutProperty()', function() {
        it('should throw an error if invoked with an invalid layout property', function() {
            var error = 'Invalid layout property specified (arg #1)';

            function invokeMethod(property) {
                return function() {
                    return $scope.toggleLayoutProperty(property);
                };
            }

            _initController();

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the layout property specified was not initialized via application config', function() {
            function testInvocation(property) {
                var error = 'Specified layout property is not supported: ' + property;
                var methodInvocation = function() {
                    return $scope.toggleLayoutProperty(property);
                };

                expect(methodInvocation).to.throw(error);
            }

            _initController();

            testInvocation('bad-property-1');
            testInvocation('foobar');
            testInvocation('   ');
        });

        it('should not throw an error if the layout property specified was initialized via application config', function() {
            function testInvocation(property) {
                var methodInvocation = function() {
                    return $scope.toggleLayoutProperty(property);
                };

                expect(methodInvocation).to.not.throw();
            }
            var configMock = _getConfigMock();
            _initController({
                'app.core.config': configMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name);
            }
        });

        it('should toggle boolean property values when a valid property is specified', function() {
            function testInvocation(property) {
                var oldValue = _getPropertyValue($scope._layout, property);

                $scope.toggleLayoutProperty(property);

                var newValue = _getPropertyValue($scope._layout, property);
                expect(newValue).to.equal(!oldValue);
            }
            var configMock = _getConfigMock({
                layout: {
                    first: true,
                    second: false,
                    third: true,
                    child: {
                        first: true,
                        second: false,
                        third: true
                    }
                }
            });
            _initController({
                'app.core.config': configMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name);
            }
        });

        it('should convert truthy values to a boolean false when toggled', function() {
            function testInvocation(property) {
                if (DEFAULT_PROPERTIES.indexOf(property) >= 0) {
                    return;
                }
                var oldValue = _getPropertyValue($scope._layout, property);

                $scope.toggleLayoutProperty(property);

                var newValue = _getPropertyValue($scope._layout, property);

                expect(oldValue).to.not.be.a('boolean');
                expect(oldValue).to.be.truthy;
                expect(newValue).to.be.false;
            }
            var configMock = _getConfigMock({
                layout: {
                    first: 'abc',
                    second: 123,
                    third: {},
                    child: {
                        first: [],
                        second: function() {}
                    }
                }
            });
            _initController({
                'app.core.config': configMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name);
            }
        });

        it('should convert falsy values to a boolean true when toggled', function() {
            function testInvocation(property) {
                if (DEFAULT_PROPERTIES.indexOf(property) >= 0) {
                    return;
                }
                var oldValue = _getPropertyValue($scope._layout, property);

                $scope.toggleLayoutProperty(property);

                var newValue = _getPropertyValue($scope._layout, property);

                expect(oldValue).to.not.be.a('boolean');
                expect(oldValue).to.be.falsy;
                expect(newValue).to.be.true;
            }
            var configMock = _getConfigMock({
                layout: {
                    first: null,
                    second: undefined,
                    third: 0,
                    child: {
                        first: null,
                        second: undefined
                    }
                }
            });
            _initController({
                'app.core.config': configMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name);
            }
        });


        it('should persist values to local storage if the persist flag is set to true', function() {
            var localStorageMock = _mockHelper.createLocalStorageMock(true);
            var localStorageSpy = _sinon.stub(localStorageMock, 'set');

            function testInvocation(property) {
                localStorageSpy.reset();

                expect(localStorageSpy).to.not.have.been.called;

                $scope.toggleLayoutProperty(property, true);

                var newValue = _getPropertyValue($scope._layout, property);
                expect(localStorageSpy).to.have.been.calledOnce;
                expect(localStorageSpy).to.have.been.calledWith('_layout.' + property, newValue);
            }
            var configMock = _getConfigMock();
            _initController({
                'app.core.config': configMock,
                localStorageService: localStorageMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name);
            }
        });

        it('should not persist values to a local storage if the persist flag is omitted or set to false', function() {
            var localStorageMock = _mockHelper.createLocalStorageMock(true);
            var localStorageSpy = _sinon.spy(localStorageMock, 'set');

            function testInvocation(property, flag) {
                localStorageSpy.reset();

                expect(localStorageSpy).to.not.have.been.called;

                $scope.toggleLayoutProperty(property, flag);

                var newValue = _getPropertyValue($scope._layout, property);
                expect(localStorageSpy).to.not.have.been.called;
            }
            var configMock = _getConfigMock();
            _initController({
                'app.core.config': configMock,
                localStorageService: localStorageMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name);
                testInvocation(item.name, false);
            }
        });

        it('should not persist values to local storage if the persist flag is set to true, but local storage is not supported', function() {
            var localStorageMock = _mockHelper.createLocalStorageMock(false);
            var localStorageSpy = _sinon.stub(localStorageMock, 'set');

            function testInvocation(property) {
                localStorageSpy.reset();

                expect(localStorageSpy).to.not.have.been.called;

                $scope.toggleLayoutProperty(property, true);

                var newValue = _getPropertyValue($scope._layout, property);
                expect(localStorageSpy).to.not.have.been.called;
            }

            var configMock = _getConfigMock();
            _initController({
                'app.core.config': configMock,
                localStorageService: localStorageMock
            });

            var list = _flatten(configMock.get('layout'));
            for (var index = 0; index < list.length; index++) {
                var item = list[index];
                testInvocation(item.name);
            }
        });
    });

    describe('toggleFullScreen()', function() {
        it('should do nothing if fullscreen mode is not enabled', function() {
            _initController({});

            $scope.__screenfull_wrapper = {
                enabled: false,
                toggle: _sinon.spy()
            };

            $scope._layout.isFullScreen = false;
            expect($scope.__screenfull_wrapper.toggle).to.not.have.been.called;

            $scope.toggleFullScreen();
            expect($scope._layout.isFullScreen).to.be.false;
            expect($scope.__screenfull_wrapper.toggle).to.not.have.been.called;
        });

        it('should toggle the value of the _layout.isFullScreen variable when invoked, and if fullscreen mode is enabled', function() {
            _initController({});

            $scope.__screenfull_wrapper = {
                enabled: true,
                toggle: _sinon.spy()
            };

            $scope._layout.isFullScreen = false;

            $scope.toggleFullScreen();
            expect($scope._layout.isFullScreen).to.be.true;

            $scope.toggleFullScreen();
            expect($scope._layout.isFullScreen).to.be.false;
        });

        it('should use the screenful library toggle fullscreen mode when invoked when fullscreen mode is enabled', function() {
            _initController({});

            $scope.__screenfull_wrapper = {
                enabled: false,
                toggle: _sinon.spy()
            };

            expect($scope.__screenfull_wrapper.toggle).to.not.have.been.called;

            $scope.toggleFullScreen();
            expect($scope.__screenfull_wrapper.toggle).to.not.have.been.called;
        });
    });

    describe('goBack()', function() {
        it('should navigate backwards on the browser history when invoked', function() {
            var $windowMock = {
                history: {
                    back: _sinon.spy()
                }
            };
            _initController({
                '$window': $windowMock
            });

            expect($windowMock.history.back).to.not.have.been.called;
            $scope.goBack();
            expect($windowMock.history.back).to.have.been.calledOnce;
        });
    });

    describe('[state transition logic]', function() {
        it('should set the stateTransitionInProgress flag to true when a state transition starts', function() {
            _initController({});

            $scope._layout.stateTransitionInProgress = false;
            $rootScope.$broadcast('$stateChangeStart');
            expect($scope._layout.stateTransitionInProgress).to.be.true;
        });

        it('should set the stateTransitionInProgress flag to false when a state transition completes successfully', function() {
            _initController({});

            $scope._layout.stateTransitionInProgress = true;
            $rootScope.$broadcast('$stateChangeSuccess');
            expect($scope._layout.stateTransitionInProgress).to.be.false;
        });

        it('should set the stateTransitionInProgress flag to false when a state transition completes with errors', function() {
            _initController({});

            $scope._layout.stateTransitionInProgress = true;
            $rootScope.$broadcast('$stateChangeError');
            expect($scope._layout.stateTransitionInProgress).to.be.false;
        });

        it('should route the user to the error state when a state transition completes with errors', function() {
            _initController({});

            expect($stateMock.go).to.not.have.been.called;
            $rootScope.$broadcast('$stateChangeError');
            expect($stateMock.go).to.have.been.calledOnce;
            expect($stateMock.go).to.have.been.calledWith('error');
        });
    });

});
