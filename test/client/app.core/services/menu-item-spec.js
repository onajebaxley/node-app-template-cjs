/* jshint expr:true */
/* global alert:true */

var _angular = require('angular');
var _ngMocks = require('angular-mocks');
var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');
var _module = 'app.core';

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

describe('[app.core.MenuItem]', function() {
    'use strict';

    function _createDefaultMenu(options) {
        options = options || {
            title: 'menu1'
        };
        return new Service(options);
    }

    function _getHierarchicalOptions() {
        return {
            title: 'item-1',
            roles: ['*'],
            childItems: [{
                title: 'item-11',
                roles: ['*'],
                childItems: [{
                    title: 'item-111',
                    roles: ['manager']
                }, {
                    title: 'item-112',
                    roles: ['user']
                }, {
                    title: 'item-113',
                    roles: ['user', 'manager']
                }]
            }, {
                title: 'item-12',
                roles: ['user'],
                childItems: [{
                    title: 'item-121',
                    roles: ['manager']
                }, {
                    title: 'item-122',
                    roles: ['manager']
                }]
            }, {
                title: 'item-13',
                roles: ['admin'],
                childItems: []
            }]
        };
    }
    beforeEach(function() {
        $stateMock = {
            __url: '',
            href: function() {}
        };

        _sinon.stub($stateMock, 'href', function(state, params) {
            return $stateMock.__url;
        });

        userMock = {
            _isLoggedIn: false,
            _roles: [],
            hasRole: function(role) {
                return userMock._roles.indexOf(role.toLowerCase()) >= 0;
            },
            isLoggedIn: function() {
                return userMock._isLoggedIn;
            }
        };
    });

    var $stateMock = null;
    var userMock = null;
    var Service = null;

    beforeEach(angular.mock.module(_module));
    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('$state', $stateMock);
        $provide.value('app.core.user', userMock);
    }]));
    beforeEach(inject(['app.core.MenuItem', function(injectedService) {
        Service = injectedService;
    }]));

    describe('[init]', function() {
        it('should define the necessary fields and methods', function() {
            expect(Service).to.be.a('function');
        });
    });

    describe('[ctor]', function() {
        it('should throw an error if invoked without a valid menu options object', function() {
            var error = 'Invalid menu options specified (arg #1)';

            function invokeMethod(options) {
                return function() {
                    return new Service(options);
                };
            }

            expect(invokeMethod(undefined)).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the menu options does not define a valid menu title', function() {
            var error = 'Menu options does not define a valid title property (menuOptions.title)';

            function invokeMethod(title) {
                return function() {
                    var options = {
                        title: title
                    };
                    return new Service(options);
                };
            }

            expect(invokeMethod(undefined)).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should return an object with required properties when invoked with valid options', function() {
            var title = 'menu1';

            var menu = new Service({
                title: title
            });

            expect(menu).to.be.an('object');
            expect(menu).to.have.property('title', title);
            expect(menu).to.have.property('position').and.to.be.a('number');

            expect(menu).to.have.property('routeState').and.to.be.a('string');
            expect(menu).to.have.property('routeParams').and.to.be.an('object');
            expect(menu).to.have.property('link').and.to.be.a('string');

            expect(menu).to.have.property('fontSet').and.to.be.a('string');
            expect(menu).to.have.property('iconName').and.to.be.a('string');

            expect(menu).to.have.property('roles').and.to.be.an('array');
            expect(menu).to.have.property('childItems').and.to.be.an('array');

            expect(menu).to.have.property('addChildItem').and.to.be.a('function');
            expect(menu).to.have.property('clearChildItems').and.to.be.a('function');
            expect(menu).to.have.property('canRender').and.to.be.a('function');
            expect(menu).to.have.property('getLink').and.to.be.a('function');
        });

        it('should apply default values to the menu properties when none are specified via the menu options', function() {
            var title = 'menu1';

            var menu = new Service({
                title: title
            });

            expect(menu.position).to.equal(0);

            expect(menu.routeState).to.equal('');
            expect(menu.routeParams).to.deep.equal({});
            expect(menu.link).to.equal('#');

            expect(menu.fontSet).to.equal('angular-material');
            expect(menu.iconName).to.equal('');

            expect(menu.roles).to.deep.equal(['*']);
            expect(menu.childItems).to.deep.equal([]);
        });

        it('should use the values specified in the menu options to initialize the menu', function() {
            var options = {
                title: 'menu2',
                position: 23,
                routeState: 'home.default',
                routeParams: {
                    foo: 'bar'
                },
                link: 'http://www.google.com',
                fontSet: 'ba ba ba',
                iconName: 'banana',
                roles: ['admin', 'user']
            };

            var menu = new Service(options);

            for (var prop in options) {
                var propVal = options[prop];
                if (typeof propVal === 'object') {
                    expect(menu[prop]).to.deep.equal(propVal);
                } else {
                    expect(menu[prop]).to.equal(options[prop]);
                }
            }
        });

        it('should create a hierarchical menu structure based on the specified options', function() {
            var options = _getHierarchicalOptions();

            function checkItemRecursive(item, options) {
                if (!(options.childItems instanceof Array)) {
                    return;
                }
                expect(item.title).to.equal(options.title);
                expect(item.childItems).to.have.length(options.childItems.length);
                for (var index = 0; index < item.childItems.length; index++) {
                    var childItem = item.childItems[index];
                    var childOptions = options.childItems[index];
                    checkItemRecursive(childItem, childOptions);
                }
            }

            var menu = new Service(options);
            checkItemRecursive(menu, options);
        });
    });

    describe('Menu.addChildItem()', function() {
        it('should throw an error if invoked without a valid menu options object', function() {
            var error = 'Invalid menu options specified (arg #1)';

            function invokeMethod(options) {
                return function() {
                    var menu = _createDefaultMenu();
                    return menu.addChildItem(options);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([1, 2, 3])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the menu options object does not define a title property', function() {
            var error = 'Menu options does not define a valid title property (menuOptions.title)';

            function invokeMethod(title) {
                return function() {
                    var options = {
                        title: title
                    };
                    var menu = _createDefaultMenu();
                    return menu.addChildItem(options);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({
                foo: 'bar'
            })).to.throw(error);
            expect(invokeMethod([1, 2, 3])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should return a menu item object when invoked', function() {
            var title = 'menu2';
            var menu = _createDefaultMenu();
            var ret = menu.addChildItem({
                title: title
            });

            expect(ret).to.be.an.instanceof(Service);
        });

        it('should add the returned item to the items menu of the parent', function() {
            var title = 'menu2';
            var menu = _createDefaultMenu();

            expect(menu.childItems).to.have.length(0);

            var ret = menu.addChildItem({
                title: title
            });

            expect(menu.childItems).to.have.length(1);
            expect(menu.childItems[0]).to.equal(ret);
        });

        it('should accept a fully defined menu object as the an argument, and add it directly to the child items', function() {
            var menu = _createDefaultMenu();
            var childMenu = _createDefaultMenu({
                title: 'child'
            });

            expect(menu.childItems).to.have.length(0);

            var ret = menu.addChildItem(childMenu);

            expect(menu.childItems).to.have.length(1);
            expect(ret).to.equal(childMenu);
            expect(menu.childItems[0]).to.equal(ret);
        });
    });

    describe('Menu.clearChildItems()', function() {
        it('should have no effect if invoked when there are no child items', function() {
            var menu = _createDefaultMenu();

            expect(menu.childItems).to.have.length(0);
            menu.clearChildItems();
            expect(menu.childItems).to.have.length(0);
        });

        it('should remove all child items from the menu when invoked', function() {
            var childItemCount = 10;
            var menu = _createDefaultMenu();

            for (var index = 0; index < childItemCount; index++) {
                menu.addChildItem({
                    title: 'item #' + index
                });
            }

            expect(menu.childItems).to.have.length(childItemCount);
            menu.clearChildItems();
            expect(menu.childItems).to.have.length(0);
        });
    });

    describe('Menu.canRender()', function() {
        it('should return true if the menu item is public', function() {
            userMock._isLoggedIn = false;
            var menu = _createDefaultMenu({
                title: 'menu1',
                roles: ['*']
            });

            expect(menu.canRender()).to.be.true;
        });

        it('should return false if the menu item is not public and the user is not logged in', function() {
            userMock._isLoggedIn = false;
            var menu = _createDefaultMenu({
                title: 'menu1',
                roles: ['user']
            });

            expect(menu.canRender()).to.be.false;
        });

        it('should return true only if the user\'s role matches the role on the menu', function() {
            userMock._isLoggedIn = true;
            userMock._roles.push('user');
            var menu = _createDefaultMenu({
                title: 'menu1',
                roles: ['user']
            });

            expect(menu.canRender()).to.be.true;
        });

        it('should return false if the user\'s role does not match the role on the menu', function() {
            userMock._isLoggedIn = true;
            userMock._roles.push('user');
            var menu = _createDefaultMenu({
                title: 'menu1',
                roles: ['manager']
            });

            expect(menu.canRender()).to.be.false;
        });
    });

    describe('Menu.getLink()', function() {
        it('should invoke the state service to determine the ui route url if the item has a ui route', function() {
            var options = {
                title: 'menu1',
                routeState: 'abcd.1234',
                routeParams: {
                    first: '1',
                    second: '2'
                }
            };
            var menu = _createDefaultMenu(options);
            var expectedLink = '#/abcd/1234';
            $stateMock.__url = expectedLink;

            expect($stateMock.href).to.not.have.been.called;
            var link = menu.getLink();
            expect($stateMock.href).to.have.been.calledOnce;
            expect($stateMock.href).to.have.been.calledWith(options.routeState, options.routeParams);
            expect(link).to.equal(expectedLink);
        });

        it('should return the value of the link property if no ui route has been specified', function() {
            var options = {
                title: 'menu1',
                link: 'http://www.google.com'
            };
            var menu = _createDefaultMenu(options);

            expect(menu.getLink()).to.equal(options.link);
        });
    });
});
