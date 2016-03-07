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

var _module = 'app.layout';
var _mockHelper = require('../../../client-utils/mock-helper');

describe('[app.layout.breadCrumb]', function() {
    'use strict';

    var factory = null;
    var MenuItemMock = null;

    beforeEach(function() {
        MenuItemMock = _mockHelper.createMenuItemMock();
    });

    beforeEach(angular.mock.module(_module));

    beforeEach(angular.mock.module(['$provide', function($provide) {
        $provide.value('app.layout.MenuItem', MenuItemMock);
    }]));

    beforeEach(inject(['app.layout.breadCrumb', function(injectedFactory, injectedMenuItem) {
        factory = injectedFactory;
    }]));

    describe('[init]', function() {
        it('should define the necessary fields and methods', function() {
            expect(factory).to.be.an('object');

            expect(factory).to.have.property('setCrumbs').and.to.be.a('function');
            expect(factory).to.have.property('getCrumbs').and.to.be.a('function');
            expect(factory).to.have.property('push').and.to.be.a('function');
            expect(factory).to.have.property('pop').and.to.be.a('function');
        });
    });

    describe('getCrumbs()', function() {
        it('should return an array when invoked', function() {
            var ret = factory.getCrumbs();

            expect(ret).to.be.an('Array');
        });

        it('should return an array of menu item objects if not empty', function() {
            var crumbs = [ 'foo', 'bar', 'baz' ];
            factory.setCrumbs(crumbs);
            var actualCrumbs = factory.getCrumbs();

            expect(actualCrumbs).to.have.length(crumbs.length);
            for(var index=0; index<actualCrumbs.length; index++) {
                var actualCrumb = actualCrumbs[index];

                expect(actualCrumb).to.be.an.instanceof(MenuItemMock);
            }
        });
    });

    describe('setCrumbs()', function() {
        it('should throw an error if invoked with a valid array', function() {
            var error = 'Invalid crumbs specified (arg #1)';

            function invokeMethod(crumbs) {
                return function() {
                    return factory.setCrumbs(crumbs);
                };
            }

            expect(invokeMethod(undefined)).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the array does not contain either strings or objects', function() {
            var error = 'Invalid crumb. Crumb should be specified as either a string or an object';

            function invokeMethod(crumb) {
                return function() {
                    var crumbs = [ crumb ];
                    return factory.setCrumbs(crumbs);
                };
            }

            expect(invokeMethod(undefined)).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should convert string items into menu items with no links and add them to the array', function() {
            var crumbs = [ 'foo', 'bar', 'baz' ];
            factory.setCrumbs(crumbs);
            var actualCrumbs = factory.getCrumbs();

            expect(actualCrumbs).to.have.length(crumbs.length);
            for(var index=0; index<actualCrumbs.length; index++) {
                var originalCrumb = crumbs[index];
                var item = actualCrumbs[index];

                expect(item.title).to.equal(originalCrumb);
            }
        });

        it('should create menu item objects using specified options if crumb items are specified as objects', function() {
            var crumbs = [ {
                title: 'foo',
                routeState: 'foo-state'
            }, {
                title: 'bar',
                link: 'http://bar'
            }, {
                title: 'baz',
            } ];
            factory.setCrumbs(crumbs);
            var actualCrumbs = factory.getCrumbs();

            expect(actualCrumbs).to.have.length(crumbs.length);
            for(var index=0; index<actualCrumbs.length; index++) {
                var originalCrumb = crumbs[index];
                var item = actualCrumbs[index];

                expect(item.title).to.equal(originalCrumb.title);
                if(typeof item.link !== 'undefined') {
                    expect(item.link).to.equal(originalCrumb.link);
                }
                if(typeof item.routeState !== 'undefined') {
                    expect(item.routeState).to.equal(originalCrumb.routeState);
                }
            }
        });

        it('should re initialize the crumb array if invoked multiple times', function() {
            var crumbs = [ 'foo', 'bar', 'baz' ];

            expect(factory.getCrumbs()).to.have.length(0);

            factory.setCrumbs(crumbs);
            expect(factory.getCrumbs()).to.have.length(crumbs.length);

            // The length should be the same, not double.
            factory.setCrumbs(crumbs);
            expect(factory.getCrumbs()).to.have.length(crumbs.length);
        });
    });

    describe('push()', function() {
        it('should throw an error if crumb is not a string or object', function() {
            var error = 'Invalid crumb. Crumb should be specified as either a string or an object';

            function invokeMethod(crumb) {
                return function() {
                    return factory.push(crumb);
                };
            }

            expect(invokeMethod(undefined)).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should convert string items into menu items with no links and add them to the end of the array', function() {
            var crumbs = [ 'foo', 'bar', 'baz' ];

            expect(factory.getCrumbs()).to.have.length(0);
            for(var index=0; index<crumbs.length; index++) {
                factory.push(crumbs[index]);
                var actualCrumbs = factory.getCrumbs();
                var item = actualCrumbs[index];

                expect(actualCrumbs).to.have.length(index + 1);
                expect(item.title).to.equal(crumbs[index]);
            }
        });

        it('should create menu item objects using specified options if crumb items are specified as objects', function() {
            var crumbs = [ {
                title: 'foo',
                routeState: 'foo-state'
            }, {
                title: 'bar',
                link: 'http://bar'
            }, {
                title: 'baz',
            } ];

            expect(factory.getCrumbs()).to.have.length(0);
            for(var index=0; index<crumbs.length; index++) {
                factory.push(crumbs[index]);
                var actualCrumbs = factory.getCrumbs();
                var originalCrumb = crumbs[index];
                var item = actualCrumbs[index];

                expect(actualCrumbs).to.have.length(index + 1);

                expect(item.title).to.equal(originalCrumb.title);
                if(typeof item.link !== 'undefined') {
                    expect(item.link).to.equal(originalCrumb.link);
                }
                if(typeof item.routeState !== 'undefined') {
                    expect(item.routeState).to.equal(originalCrumb.routeState);
                }
            }
        });
    });

    describe('pop()', function() {
        it('should remove and return the last element from the bread crumb when invoked', function() {
            var crumbs = [ 'foo', 'bar', 'baz' ];
            factory.setCrumbs(crumbs);

            for(var index = crumbs.length - 1; index >= 0; index--) {
                var ret = factory.pop();

                expect(factory.getCrumbs()).to.have.length(index);
                expect(ret).to.be.an.instanceof(MenuItemMock);
                expect(ret.title).to.equal(crumbs[index]);
            }
        });

        it('should have no effect if the bread crumb list is empty', function() {
            expect(factory.getCrumbs()).to.have.length(0);
            var ret = factory.pop();

            expect(factory.getCrumbs()).to.have.length(0);
            expect(ret).to.be.undefined;
        });
    });

});
