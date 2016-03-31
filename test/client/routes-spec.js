/* jshint expr:true */

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _routes = require('../../client/js/routes');


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

        function _checkRouteSetup(module, stateProvider, count, state, params) {
            expect(stateProvider.state.callCount).to.be.at.least(count);

            var callIndex = count - 1;
            var args = stateProvider.state.args[callIndex];

            expect(args[0]).to.equal(state);

            // Testing too much here makes the code less flexible, requiring
            // test changes for every small change in routes. There may be
            // advantages to making the test code more specific, but it is
            // probably better left to a stage when the project routes are
            // very stable.
            var routeConfig = args[1];
            expect(routeConfig).to.be.an('object');
            expect(routeConfig.url).to.equal(params.url);
        }

        it('should setup a default route of "/explore" when invoked', function() {
            expect(urlRouterProvider.otherwise).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            expect(urlRouterProvider.otherwise).to.have.been.calledOnce;
            expect(urlRouterProvider.otherwise).to.have.been.calledWith('/explore');
        });

        it('should setup an application route for the error state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            _checkRouteSetup(module, stateProvider, 1, 'error', {
                url: '/error'
            });
        });

        it('should setup an application route for the explore state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            _checkRouteSetup(module, stateProvider, 2, 'explore', {
                url: '/explore'
            });
        });

        it('should setup an application route for the nodes state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            _checkRouteSetup(module, stateProvider, 3, 'nodes', {
                url: '/nodes'
            });
        });

        it('should setup an application route for the create node state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            _checkRouteSetup(module, stateProvider, 4, 'create_node', {
                url: '/create-node'
            });
        });

        it('should setup an application route for the gateways state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            _checkRouteSetup(module, stateProvider, 5, 'gateways', {
                url: '/gateways'
            });
        });

        it('should setup an application route for the create gateway state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            _checkRouteSetup(module, stateProvider, 6, 'create_gateway', {
                url: '/create-gateway'
            });
        });

        it('should setup an application route for the manage account settings state when invoked', function() {
            expect(stateProvider.state).to.not.have.been.called;

            module(stateProvider, urlRouterProvider);

            _checkRouteSetup(module, stateProvider, 7, 'account', {
                url: '/account'
            });
        });
    });
});
