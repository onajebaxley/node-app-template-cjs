/* jshint expr:true */

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _routes = require('../../client/js/routes');
var _mockHelper = require('../client-utils/mock-helper');


describe('[app.routes]', function() {
    'use strict';

    describe('[init]', function() {
        it('should return an array', function() {
            expect(_routes).to.be.an('Array');

            var module = _routes[_routes.length - 1];
            expect(module).to.be.a('function');
        });
    });

    describe('[route setup]', function() {
        var module = null;
        var stateProvider = null;
        var urlRouterProvider = null;

        beforeEach(function() {
            stateProvider = {};
            stateProvider.state = _sinon.stub().returns(stateProvider);

            urlRouterProvider = {};
            urlRouterProvider.otherwise = _sinon.spy();

            module = _routes[_routes.length - 1];
        });

        function _checkRouteSetup(module, stateProvider, state, params) {
            var args = null;

            for (var index = 0; index < stateProvider.state.args.length; index++) {
                args = stateProvider.state.args[index];
                if (args[0] === state) {
                    break;
                } else {
                    args = null;
                }
            }

            // Testing too much here makes the code less flexible, requiring
            // test changes for every small change in routes. There may be
            // advantages to making the test code more specific, but it is
            // probably better left to a stage when the project routes are
            // very stable.
            var routeConfig = args[1];
            expect(routeConfig).to.be.an('object');
            expect(routeConfig.url).to.equal(params.url);

            return routeConfig;
        }

        function _verifyBcSetOnEnter(config, crumbs) {
            expect(config.onEnter).to.be.an('Array');
            var handler = config.onEnter[1];

            expect(handler).to.be.a('function');
            var bcMock = _mockHelper.createBreadCrumbMock();

            expect(bcMock.setCrumbs).to.not.have.been.called;
            handler(bcMock);
            expect(bcMock.setCrumbs).to.have.been.calledOnce;
            expect(bcMock.setCrumbs.args[0][0]).to.deep.equal(crumbs);
        }

        function _verifyBcPushOnEnter(config, crumb) {
            expect(config.onEnter).to.be.an('Array');
            var handler = config.onEnter[1];

            expect(handler).to.be.a('function');
            var bcMock = _mockHelper.createBreadCrumbMock();

            expect(bcMock.push).to.not.have.been.called;
            handler(bcMock);
            expect(bcMock.push).to.have.been.calledOnce;
            expect(bcMock.push.args[0][0]).to.deep.equal(crumb);
        }

        function _verifyBcPopOnExit(config) {
            expect(config.onExit).to.be.an('Array');
            var handler = config.onExit[1];

            expect(handler).to.be.a('function');
            var bcMock = _mockHelper.createBreadCrumbMock();

            expect(bcMock.pop).to.not.have.been.called;
            handler(bcMock);
            expect(bcMock.pop).to.have.been.calledOnce;
        }

        it('should setup a default route of "/" when invoked', function() {
            expect(urlRouterProvider.otherwise).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            expect(urlRouterProvider.otherwise).to.have.been.calledOnce;
            expect(urlRouterProvider.otherwise).to.have.been.calledWith('/');
        });

        it('should setup an application route for the home state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            var config = _checkRouteSetup(module, stateProvider, 'home', {
                url: '/'
            });
            _verifyBcSetOnEnter(config, [{
                title: 'Dashboard'
            }]);
        });

        it('should setup an application route for the error state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            var config = _checkRouteSetup(module, stateProvider, 'error', {
                url: '/error'
            });

            _verifyBcPushOnEnter(config, {
                title: 'Error'
            }, true);

            _verifyBcPopOnExit(config);
        });

        it('should setup an application route for the user profile state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            var config = _checkRouteSetup(module, stateProvider, 'user', {
                url: '/user'
            });

            _verifyBcSetOnEnter(config, [{
                title: 'Dashboard',
                routeState: 'home'
            }, {
                title: 'User Profile'
            }]);
        });
    });
});
