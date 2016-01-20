/* jshint node:true, expr:true */
'use strict';

var _path = require('path');
var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _rewire = require('rewire');

var _expressMocks = require('../utils/express-mocks');
var _appHelper = require('../utils/app-helper');
var _configHelper = require('../utils/config-helper');
var _loggerHelper = require('../utils/logger-helper');
var _routes = null;

describe('[server.routes]', function() {

    var _configParams = {
        staticDir: '/static',
        mountPath: '/mount',
        rootPath: '/',
        // These two parameters should be true by default so that the call
        // sequence for app.use() is predictable in the test cases.
        enableDynamicCss: true,
        enableDynamicJs: true
    };
    var _coreHandlerProviderMock;

    beforeEach(function() {
        _coreHandlerProviderMock = _sinon.stub().returns({
            accessLoggerMiddleware: _sinon.stub().returns(function() {}),
            dynamicJsCompileMiddleware: _sinon.stub().returns(function() {}),
            dynamicCssCompileMiddleware: _sinon.stub().returns(function() {}),
            faviconHandler: _sinon.stub().returns(function() {}),
            resourceNotFoundErrorHandler: _sinon.stub().returns(function() {}),
            authenticationErrorHandler: _sinon.stub().returns(function() {}),
            catchAllErrorHandler: _sinon.stub().returns(function() {})
        });

        _routes = _rewire('../../server/routes');
        _routes.__set__('_logger', _loggerHelper.initLogger(true));
        _routes.__set__('CoreHandlerProvider', _coreHandlerProviderMock);

        _configHelper.setConfig('cfg_static_dir', _configParams.staticDir);
        _configHelper.setConfig('cfg_mount_path', _configParams.mountPath);
        _configHelper.setConfig('cfg_root_path', _configParams.rootPath);
        _configHelper.setConfig('cfg_enable_dyamic_js_compile', _configParams.enableDynamicJs);
        _configHelper.setConfig('cfg_enable_dyamic_css_compile', _configParams.enableDynamicCss);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('[init]', function() {
        it('should expose the necessary fields and methods', function() {
            expect(_routes).to.have.property('configure').and.to.be.a('function');
        });
    });

    describe('configure()', function() {
        it('should throw an error if invoked without a valid app object', function() {
            var error = 'Invalid app object specified (arg #1)';

            var invokeMethod = function(app) {
                return function() {
                    _routes.configure(app);
                };
            };

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
        });

        it('should create an instance of the core handler provider object', function() {
            var mockApp = _appHelper.getMockApp();

            expect(_coreHandlerProviderMock).to.not.have.been.called;
            _routes.configure(mockApp);
            
            expect(_coreHandlerProviderMock).to.have.been.calledOnce;
            expect(_coreHandlerProviderMock).to.have.been.calledWithNew;
            expect(_coreHandlerProviderMock).to.have.
                    been.calledWith(_configParams.staticDir, _configParams.rootPath);
        });

        it('should register the access logger middleware as the first handler', function() {
            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.accessLoggerMiddleware).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);
            
            expect(provider.accessLoggerMiddleware).to.have.been.calledOnce;
            expect(mockApp.use.callCount).to.be.at.least(1);
            expect(mockApp.use.args[0][0]).to.equal(provider.accessLoggerMiddleware());
        });

        it('should register the css compile middleware if enabled via configuration', function() {
            _configHelper.setConfig('cfg_enable_dyamic_css_compile', true);

            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.dynamicCssCompileMiddleware).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);
            
            expect(provider.dynamicCssCompileMiddleware).to.have.been.calledOnce;
            expect(mockApp.use.callCount).to.be.at.least(2);
            expect(mockApp.use.args[1][0]).to.equal(provider.dynamicCssCompileMiddleware());
        });

        it('should not register the css compile middleware if disabled via configuration', function() {
            _configHelper.setConfig('cfg_enable_dyamic_css_compile', false);

            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.dynamicCssCompileMiddleware).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);
            
            expect(provider.dynamicCssCompileMiddleware).to.not.have.been.called;
        });

        it('should register the js compile middleware if enabled via configuration', function() {
            _configHelper.setConfig('cfg_enable_dyamic_js_compile', true);

            var jsFilePath = '/js/app.js';
            var mountPath = _path.join(_configParams.mountPath, jsFilePath);
            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.dynamicJsCompileMiddleware).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);
            
            expect(provider.dynamicJsCompileMiddleware).to.have.been.calledOnce;

            expect(mockApp.use.callCount).to.be.at.least(3);
            expect(mockApp.use.args[2][0]).to.equal(mountPath);
            expect(mockApp.use.args[2][1]).to.equal(provider.dynamicJsCompileMiddleware());
        });

        it('should not register the js compile middleware if disabled via configuration', function() {
            _configHelper.setConfig('cfg_enable_dyamic_js_compile', false);

            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.dynamicJsCompileMiddleware).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);
            
            expect(provider.dynamicJsCompileMiddleware).to.not.have.been.called;
        });

        it('should bind a handler to handle requests for favicon.ico', function() {
            var faviconPath = 'img/favicon.ico';
            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.faviconHandler).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);

            expect(provider.faviconHandler).to.have.been.calledOnce;
            expect(provider.faviconHandler).to.have.been.calledWith(faviconPath);

            expect(mockApp.use.callCount).to.be.at.least(4);
            expect(mockApp.use.args[3][0]).to.equal(provider.faviconHandler());
        });

        it('should bind a handler for authentication errors before the 404 error handler is bound', function() {
            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.authenticationErrorHandler).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);

            expect(provider.authenticationErrorHandler).to.have.been.calledOnce;
            expect(mockApp.use.callCount).to.be.at.least(5);
            var callIndex = mockApp.use.callCount - 3;
            expect(mockApp.use.args[callIndex][0]).to.equal(provider.authenticationErrorHandler());
        });

        it('should bind a handler for 404 errors (resource not found) before the catch all error handler is bound', function() {
            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.resourceNotFoundErrorHandler).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);

            expect(provider.resourceNotFoundErrorHandler).to.have.been.calledOnce;
            expect(mockApp.use.callCount).to.be.at.least(6);
            var callIndex = mockApp.use.callCount - 2;
            expect(mockApp.use.args[callIndex][0]).to.equal(provider.resourceNotFoundErrorHandler());
        });

        it('should bind a catch all handler at the very end to handle all errors raised during request processing', function() {
            var mockApp = _appHelper.getMockApp();
            var provider = _coreHandlerProviderMock();

            expect(provider.catchAllErrorHandler).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;
            _routes.configure(mockApp);

            expect(provider.catchAllErrorHandler).to.have.been.calledOnce;
            var callIndex = mockApp.use.callCount - 1;
            expect(mockApp.use.callCount).to.be.at.least(7);
            expect(mockApp.use.args[callIndex][0]).to.equal(provider.catchAllErrorHandler());
        });

        it('should have no impact if invoked multiple times', function() {
            var mockApp = _appHelper.getMockApp();

            _routes.configure(mockApp);
            mockApp.use.reset();

            _routes.configure(mockApp);
            expect(mockApp.use).to.not.have.been.called;
        });

    });

});
