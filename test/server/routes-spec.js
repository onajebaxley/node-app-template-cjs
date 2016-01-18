/* jshint node:true, expr:true */
'use strict';

var _path = require('path');
var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _rewire = require('rewire');

var _appHelper = require('../utils/app-helper');
var _configHelper = require('../utils/config-helper');
var _loggerHelper = require('../utils/logger-helper');
var _routes = null;

describe('[server.routes]', function() {

    var _configParams = {
        staticDir: '/static',
        mountPath: '/mount',
        rootPath: '/',
        enableDynamicCss: true,
        enableDynamicJs: true
    };
    var _morganMock;
    var _sassMiddlewareMock;
    var _browserifyMiddlewareMock;
    var _faviconMock;

    beforeEach(function() {
        _morganMock = _sinon.stub().returns({ module: 'morgan' });
        _sassMiddlewareMock = _sinon.stub().returns({ module: 'node-sass-middleware' });
        _browserifyMiddlewareMock = _sinon.stub().returns({ module: 'browserify-middleware' });
        _faviconMock = _sinon.stub().returns({ module: 'favicon' });

        _routes = _rewire('../../server/routes');
        _routes.__set__('_logger', _loggerHelper.initLogger(true));
        _routes.__set__('_morgan', _morganMock);
        _routes.__set__('_nodeSassMiddleware', _sassMiddlewareMock);
        _routes.__set__('_browserifyMiddleware', _browserifyMiddlewareMock);
        _routes.__set__('_favicon', _faviconMock);

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

        it('should initialize the access logger with a persistent store and bind it to the app', function() {
            var mockApp = _appHelper.getMockApp();

            expect(_morganMock).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;

            _routes.configure(mockApp);

            expect(_morganMock).to.have.been.calledOnce;
            expect(_morganMock.args[0][0]).to.equal('common');
            var loggerStream = _morganMock.args[0][1];
            expect(loggerStream).to.be.an('object');
            expect(loggerStream.stream).to.be.an('object');
            expect(loggerStream.stream).to.have.property('write').and.to.be.a('function');

            var actualLogger = _routes.__get__('_logger').getLogger('access');
            var message = 'hello';
            expect(actualLogger.info).to.not.have.been.called;
            //Trailing newline added here should be excluded when checked.
            loggerStream.stream.write(message + '\n');
            expect(actualLogger.info).to.have.been.calledOnce;

            expect(actualLogger.info.args[0][0]).to.equal(message);

            // This has to be here so that it does not interfere with previous
            // call count checks.
            var mockResult = _morganMock();
            expect(mockApp.use.callCount).to.be.at.least(1);
            expect(mockApp.use.args[0][0]).to.equal(mockResult);
        });

        it('should initialize and bind dynamic css compile middleware if enabled via configuration', function() {
            _configHelper.setConfig('cfg_enable_dyamic_css_compile', true);
            var mockApp = _appHelper.getMockApp();

            expect(_sassMiddlewareMock).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;

            _routes.configure(mockApp);

            expect(_sassMiddlewareMock).to.have.been.calledOnce;
            expect(_sassMiddlewareMock.args[0][0]).to.deep.equal({
                src: _configParams.staticDir,
                prefix: _configParams.rootPath,
                debug: true,
                response: true,
                outputStyle: 'nested'
            });

            // This has to be here so that it does not interfere with previous
            // call count checks.
            var mockResult = _sassMiddlewareMock();
            expect(mockApp.use.callCount).to.be.at.least(2);
            expect(mockApp.use.args[1][0]).to.equal(mockResult);
        });

        it('should not initialize and bind dynamic css compile middleware if not enabled via configuration', function() {
            _configHelper.setConfig('cfg_enable_dyamic_css_compile', false);
            var mockApp = _appHelper.getMockApp();

            expect(_sassMiddlewareMock).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;

            _routes.configure(mockApp);

            expect(_sassMiddlewareMock).to.not.have.been.called;

            // This has to be here so that it does not interfere with previous
            // call count checks.
            var mockResult = _sassMiddlewareMock();
            expect(mockApp.use).to.not.have.been.calledWith(mockResult);
        });

        it('should initialize and bind dynamic js compile middleware if enabled via configuration', function() {
            // Include the config for dynamic css so that call sequence for
            // app.use() is predictable.
            _configHelper.setConfig('cfg_enable_dyamic_css_compile', true);
            _configHelper.setConfig('cfg_enable_dyamic_js_compile', true);
            var mockApp = _appHelper.getMockApp();

            expect(_browserifyMiddlewareMock).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;

            _routes.configure(mockApp);

            expect(_browserifyMiddlewareMock).to.have.been.calledOnce;
            var srcPath = _path.join(_configParams.staticDir, '/js/app.js');
            expect(_browserifyMiddlewareMock.args[0][0]).to.equal(srcPath);

            // This has to be here so that it does not interfere with previous
            // call count checks.
            var bundlePath = _path.join(_configParams.mountPath, '/js/app.js');
            var mockResult = _browserifyMiddlewareMock();
            expect(mockApp.use.callCount).to.be.at.least(3);
            expect(mockApp.use.args[2][0]).to.equal(bundlePath);
            expect(mockApp.use.args[2][1]).to.equal(mockResult);
        });

        it('should not initialize and bind dynamic js compile middleware if not enabled via configuration', function() {
            // Include the config for dynamic css so that call sequence for
            // app.use() is predictable.
            _configHelper.setConfig('cfg_enable_dyamic_css_compile', true);
            _configHelper.setConfig('cfg_enable_dyamic_js_compile', false);
            var mockApp = _appHelper.getMockApp();

            expect(_browserifyMiddlewareMock).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;

            _routes.configure(mockApp);

            expect(_browserifyMiddlewareMock).to.not.have.been.called;

            // This has to be here so that it does not interfere with previous
            // call count checks.
            var bundlePath = _path.join(_configParams.mountPath, '/js/app.js');
            var mockResult = _browserifyMiddlewareMock();
            expect(mockApp.use).to.not.have.been.calledWith(bundlePath, mockResult);
        });

        it('should initialize and bind a handler to handle requests for favicon.ico', function() {
            // Include the config for dynamic js and css so that call sequence for
            // app.use() is predictable.
            _configHelper.setConfig('cfg_enable_dyamic_css_compile', true);
            _configHelper.setConfig('cfg_enable_dyamic_js_compile', true);
            var mockApp = _appHelper.getMockApp();

            expect(_faviconMock).to.not.have.been.called;
            expect(mockApp.use).to.not.have.been.called;

            _routes.configure(mockApp);

            expect(_faviconMock).to.have.been.calledOnce;
            var faviconPath = _path.join(_configParams.staticDir, 'img/favicon.ico');
            expect(_faviconMock.args[0][0]).to.equal(faviconPath);

            // This has to be here so that it does not interfere with previous
            // call count checks.
            var mockResult = _faviconMock();
            expect(mockApp.use.callCount).to.be.at.least(4);
            expect(mockApp.use.args[3][0]).to.equal(mockResult);
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
