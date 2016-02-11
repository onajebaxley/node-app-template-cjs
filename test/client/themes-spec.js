/* jshint expr:true */

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _themes = require('../../client/js/themes');


describe('[app.themes]', function() {
    'use strict';

    describe('[init]', function() {
        it('should return an array', function() {
            expect(_themes).to.be.an('Array');

            var module = _themes[_themes.length - 1];
            expect(module).to.be.a('function');
        });
    });

    describe('[themes setup]', function() {
        var module = null;
        var mdThemingProvider = null;
        var themeMock = null;

        beforeEach(function() {
            themeMock = {};
            mdThemingProvider = {};
            mdThemingProvider.theme = _sinon.stub().returns(themeMock);
            themeMock.primaryPalette = _sinon.stub().returns(themeMock);
            themeMock.accentPalette = _sinon.stub().returns(themeMock);
            themeMock.warnPalette = _sinon.stub().returns(themeMock);
            themeMock.backgroundPalette = _sinon.stub().returns(themeMock);

            module = _themes[_themes.length - 1];
        });

        it('should configure the palettes for the default theme', function() {
            expect(mdThemingProvider.theme).to.not.have.been.called;
            module(mdThemingProvider);
            expect(mdThemingProvider.theme).to.have.been.calledOnce;
            expect(mdThemingProvider.theme).to.have.been.calledWith('default');
        });

        //Note: Deeper test cases have been deliberately omitted, as there is limited
        //value in testing theme settings.

    });
});
