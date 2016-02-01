/* jshint expr:true */
'use strict';

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _routes = require('../../client/js/routes');


describe('[app.routes]', function() {

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
            expect(args[1]).to.deep.equal(params);
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

            _checkRouteSetup(module, stateProvider, 1, 'home', {
                url: '/',
                templateUrl: '/views/portal-view.html'
            });
        });
    });
});
