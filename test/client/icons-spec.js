/* jshint expr:true */
'use strict';

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _icons = require('../../client/js/icons');


describe('[app.icons]', function() {

    describe('[init]', function() {
        it('should return an array', function() {
            expect(_icons).to.be.an('Array');

            var module = _icons[_icons.length - 1];
            expect(module).to.be.a('function');
        });
    });

    describe('[icons setup]', function() {
        var module = null;
        var mdIconProvider = null;
        var appSettings = null;

        function _initModule(rootPath) {
            mdIconProvider = {};
            mdIconProvider.icon = _sinon.stub().returns(mdIconProvider);
            mdIconProvider.iconSet = _sinon.stub().returns(mdIconProvider);

            appSettings = {
                root_path: rootPath
            };
            module = _icons[_icons.length - 1];
        };

        function _checkIconConfig(module, mdIconProvider, count, key, path) {
            expect(mdIconProvider.icon.callCount).to.be.at.least(count);

            var callIndex = count - 1;
            var args = mdIconProvider.icon.args[callIndex];

            expect(args[0]).to.equal(key);
            expect(args[1]).to.deep.equal(path);
        }

        function _runIconConfigTest(count, key, path, rootPath) {
            _initModule(rootPath);
            rootPath = rootPath || '/';

            expect(mdIconProvider.icon).to.not.have.been.called;

            module(mdIconProvider, appSettings);

            _checkIconConfig(module, mdIconProvider, count, key, rootPath + path);
        }

        it('should setup an application route for the home state when invoked', function() {
            _runIconConfigTest(1, 'logo', 'img/logo.svg');
            _runIconConfigTest(1, 'logo', 'img/logo.svg', '/root/');
        });

        it('should setup an application route for the home state when invoked', function() {
            _runIconConfigTest(2, 'avatar', 'img/user.svg');
            _runIconConfigTest(2, 'avatar', 'img/user.svg', '/root/');
        });
    });
});
