/* jshint expr:true */

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _layout = require('../../client/js/layout');


describe('[app.themes]', function() {
    'use strict';

    describe('[init]', function() {
        it('should return an array', function() {
            expect(_layout).to.be.an('Array');

            var module = _layout[_layout.length - 1];
            expect(module).to.be.a('function');
        });
    });

    describe('[layout setup]', function() {
        var module = null;
        var configProvider = null;

        beforeEach(function() {
            configProvider = {};
            configProvider.set = _sinon.spy();

            module = _layout[_layout.length - 1];
        });

        it('should configure default layout properties', function() {
            expect(configProvider.set).to.not.have.been.called;
            module(configProvider);
            expect(configProvider.set).to.have.been.calledOnce;
            expect(configProvider.set).to.have.been.calledWith('layout');
            var layoutConfig = configProvider.set.args[0][1];
            expect(layoutConfig).to.be.an('object');

            expect(layoutConfig).to.have.property('leftSidebar').and.to.be.an('object');
            expect(layoutConfig.leftSidebar).to.have.property('isPinned').and.to.be.a('boolean');
            expect(layoutConfig.leftSidebar).to.have.property('isExpanded').and.to.be.a('boolean');
            expect(layoutConfig.leftSidebar).to.have.property('isOpen').and.to.be.a('boolean');
        });

        //Note: Deeper test cases have been deliberately omitted, as there is limited
        //value in testing theme settings.

    });
});
