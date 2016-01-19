/* jshint node:true, expr:true */
'use strict';

var _path = require('path');
var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var _rewire = require('rewire');
var _expressMocks = require('../../utils/express-mocks');
var _configHelper = require('../../utils/config-helper');
var _loggerHelper = require('../../utils/logger-helper');
var CoreHandlerProvider = null;
var InvalidSessionError = require('../../../server/lib/invalid-session-error');

describe('CoreHandlerProvider', function() {
    var _morganMock;
    var _browserifyMiddlewareMock;
    var _sassMiddlewareMock;
    var _faviconMock;

    beforeEach(function() {
        _morganMock = _sinon.stub().returns(function() {});
        _browserifyMiddlewareMock = _sinon.stub().returns(function() {});
        _sassMiddlewareMock = _sinon.stub().returns(function() {});
        _faviconMock = _sinon.stub().returns(function() {});

        CoreHandlerProvider = _rewire('../../../server/handlers/core-handler-provider');
        CoreHandlerProvider.__set__('_logger', _loggerHelper.initLogger(true));
        CoreHandlerProvider.__set__('_morgan', _morganMock);
        CoreHandlerProvider.__set__('_browserifyMiddleware', _browserifyMiddlewareMock);
        CoreHandlerProvider.__set__('_nodeSassMiddleware', _sassMiddlewareMock);
        CoreHandlerProvider.__set__('_favicon', _faviconMock);
    });

    afterEach(function() {
        _configHelper.restoreConfig();
    });

    describe('ctor()', function() {
        it('should expose the methods required by the interface', function() {
            var provider = new CoreHandlerProvider();

            expect(provider).to.be.an('object');
            expect(provider).to.have.property('accessLoggerMiddleware').and.to.be.a('function');
            expect(provider).to.have.property('dynamicJsCompileMiddleware').and.to.be.a('function');
            expect(provider).to.have.property('dynamicCssCompileMiddleware').and.to.be.a('function');

            expect(provider).to.have.property('faviconHandler').and.to.be.a('function');
            expect(provider).to.have.property('resourceNotFoundErrorHandler').and.to.be.a('function');
            expect(provider).to.have.property('authenticationErrorHandler').and.to.be.a('function');
            expect(provider).to.have.property('catchAllErrorHandler').and.to.be.a('function');
        });
    });

    describe('accessLoggerMiddleware()', function() {
        it('should return a function when invoked', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.accessLoggerMiddleware();

            expect(handler).to.be.a('function');
        });

        it('should initialize an access logger when invoked', function() {
            var provider = new CoreHandlerProvider();

            expect(_morganMock).to.not.have.been.called;
            var handler = provider.accessLoggerMiddleware();
            expect(_morganMock).to.have.been.calledOnce;
            expect(_morganMock.args[0][0]).to.equal('common');
            var loggerStream = _morganMock.args[0][1];
            expect(loggerStream).to.be.an('object');
            expect(loggerStream.stream).to.be.an('object');
            expect(loggerStream.stream).to.have.property('write').and.to.be.a('function');
        });

        it('should write access logs to an underlying persistent logger', function() {
            var provider = new CoreHandlerProvider();

            var handler = provider.accessLoggerMiddleware();

            var actualLogger = CoreHandlerProvider.__get__('_logger').getLogger('access');
            var loggerStream = _morganMock.args[0][1];
            var expectedMessage = 'page access log record';
            var accessLogMessage = expectedMessage + '\n';

            expect(actualLogger.info).to.not.have.been.called;
            loggerStream.stream.write(accessLogMessage);

            expect(actualLogger.info).to.have.been.calledOnce;
            expect(actualLogger.info.args[0][0]).to.equal(expectedMessage);
        });
    });

    describe('dynamicJsCompileMiddleware()', function() {
        it('should throw an error if invoked without a valid static directory path', function() {
            var error = 'Invalid static directory specified (arg #1)';

            function invoke(staticDir) {
                return function() {
                    var provider = new CoreHandlerProvider();
                    var handler = provider.dynamicJsCompileMiddleware(staticDir);
                };
            }

            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function(){})).to.throw(error);
        });

        it('should return a function when invoked with a valid static directory path', function() {
            var staticDir = './client';
            var provider = new CoreHandlerProvider();
            var handler = provider.dynamicJsCompileMiddleware(staticDir);

            expect(handler).to.be.a('function');
        });

        it('should return initialize the middleware using the browserify-middleware library', function() {
            var staticDir = './client';
            var provider = new CoreHandlerProvider();

            expect(_browserifyMiddlewareMock).to.not.have.been.called;
            var handler = provider.dynamicJsCompileMiddleware(staticDir);

            var srcPath = _path.join(staticDir, '/js/app.js');
            expect(_browserifyMiddlewareMock).to.have.been.calledOnce;
            expect(_browserifyMiddlewareMock.args[0][0]).to.equal(srcPath);
        });

        it('should default the js filename parameter to "/js/app.js" if a valid filename is not specified', function() {
            var staticDir = '/client';
            function checkFilenameDefault(filePath) {
                var provider = new CoreHandlerProvider();
                var handler = provider.dynamicJsCompileMiddleware(staticDir, filePath);

                var srcPath = _path.join(staticDir, '/js/app.js');
                expect(_browserifyMiddlewareMock.args[0][0]).to.equal(srcPath);
            }

            checkFilenameDefault(undefined);
            checkFilenameDefault(null);
            checkFilenameDefault(123);
            checkFilenameDefault('');
            checkFilenameDefault(true);
            checkFilenameDefault([]);
            checkFilenameDefault({});
            checkFilenameDefault(function(){});
        });

        it('should generate the source path using the optional js filename parameter if one was specified', function() {
            var staticDir = '/client';
            var jsFile = '/app/foo/bar.js';
            var provider = new CoreHandlerProvider();
            var handler = provider.dynamicJsCompileMiddleware(staticDir, jsFile);

            var srcPath = _path.join(staticDir, jsFile);
            expect(_browserifyMiddlewareMock.args[0][0]).to.equal(srcPath);
        });
    });

    describe('dynamicCssCompileMiddleware()', function() {
        it('should throw an error if invoked without a valid static directory path', function() {
            var error = 'Invalid static directory specified (arg #1)';

            function invoke(staticDir) {
                return function() {
                    var provider = new CoreHandlerProvider();
                    var handler = provider.dynamicCssCompileMiddleware(staticDir);
                };
            }

            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function(){})).to.throw(error);
        });

        it('should throw an error if invoked without a valid root path', function() {
            var error = 'Invalid root path specified (arg #2)';

            function invoke(rootPath) {
                return function() {
                    var provider = new CoreHandlerProvider();
                    var handler = provider.dynamicCssCompileMiddleware('staticdir', rootPath);
                };
            }

            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function(){})).to.throw(error);
        });

        it('should return a function when invoked with valid parameters', function() {
            var staticDir = './client';
            var rootPath = './root';
            var provider = new CoreHandlerProvider();
            var handler = provider.dynamicCssCompileMiddleware(staticDir, rootPath);

            expect(handler).to.be.a('function');
        });

        it('should return initialize the middleware using the node-sass-middleware library', function() {
            var staticDir = './client'
            var rootPath = './root';
            var provider = new CoreHandlerProvider();

            expect(_sassMiddlewareMock).to.not.have.been.called;
            var handler = provider.dynamicCssCompileMiddleware(staticDir, rootPath);

            expect(_sassMiddlewareMock).to.have.been.calledOnce;
            expect(_sassMiddlewareMock.args[0][0]).to.deep.equal({
                src: staticDir,
                prefix: rootPath,
                debug: true,
                response: true,
                outputStyle: 'nested'
            });
        });
    });

    describe('faviconHandler()', function() {
        it('should throw an error if invoked without a valid static directory path', function() {
            var error = 'Invalid static directory specified (arg #1)';

            function invoke(staticDir) {
                return function() {
                    var provider = new CoreHandlerProvider();
                    var handler = provider.faviconHandler(staticDir);
                };
            }

            expect(invoke(undefined)).to.throw(error);
            expect(invoke(null)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function(){})).to.throw(error);
        });

        it('should return a function when invoked', function() {
            var staticDir = './client';
            var provider = new CoreHandlerProvider();
            var handler = provider.faviconHandler(staticDir);

            expect(handler).to.be.a('function');
        });

        it('should return initialize the middleware using the favicon library', function() {
            var staticDir = './client';
            var provider = new CoreHandlerProvider();

            expect(_faviconMock).to.not.have.been.called;
            var handler = provider.faviconHandler(staticDir);

            var srcPath = _path.join(staticDir, 'img/favicon.ico');
            expect(_faviconMock).to.have.been.calledOnce;
            expect(_faviconMock.args[0][0]).to.equal(srcPath);
        });

        it('should default the icon filename parameter to "img/favicon.ico" if a valid file path is not specified', function() {
            var staticDir = '/client';
            function checkFilenameDefault(filePath) {
                var provider = new CoreHandlerProvider();
                var handler = provider.faviconHandler(staticDir, filePath);

                var srcPath = _path.join(staticDir, 'img/favicon.ico');
                expect(_faviconMock.args[0][0]).to.equal(srcPath);
            }

            checkFilenameDefault(undefined);
            checkFilenameDefault(null);
            checkFilenameDefault(123);
            checkFilenameDefault('');
            checkFilenameDefault(true);
            checkFilenameDefault([]);
            checkFilenameDefault({});
            checkFilenameDefault(function(){});
        });

        it('should generate the icon file path using the optional file path parameter if one was specified', function() {
            var staticDir = '/client';
            var filePath = 'icons/favicon.ico';
            var provider = new CoreHandlerProvider();
            var handler = provider.faviconHandler(staticDir, filePath);

            var srcPath = _path.join(staticDir, filePath);
            expect(_faviconMock.args[0][0]).to.equal(srcPath);
        });
    });

    describe('resourceNotFoundErrorHandler()', function() {
        it('should return a function when invoked', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.resourceNotFoundErrorHandler();

            expect(handler).to.be.a('function');
        });

        it('should set the status code to 404 when invoked', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.resourceNotFoundErrorHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            handler(req, res, next);

            expect(res.status).to.have.been.calledOnce;
            expect(res.status).to.have.been.calledWith(404);
        });

        it('should render the error page with the correct information', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.resourceNotFoundErrorHandler();

            var resourcePath = '/missing/resource';
            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            req.path = resourcePath;
            handler(req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render).to.have.been.calledWith('error');
            expect(res.render.args[0][1]).to.deep.equal({
                code: 404,
                primaryMessage: 'We could not find what you were looking for.',
                secondaryMessage: 'Perhaps you typed it in incorrectly?',
                errorInfo: resourcePath
            });
        });

        it('should not call next()', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.resourceNotFoundErrorHandler();

            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            handler(req, res, next);
            expect(next).to.not.have.been.called;
        });
    });

    describe('authenticationErrorHandler()', function() {
        it('should return a function when invoked', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.authenticationErrorHandler();

            expect(handler).to.be.a('function');
        });

        it('should call next() if the specified error is not an authentication error', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.authenticationErrorHandler();

            var err = new Error('not an authentication error');
            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            handler(err, req, res, next);

            expect(res.status).to.not.have.been.called;
            expect(res.render).to.not.have.been.called;
            expect(res.redirect).to.not.have.been.called;

            expect(next).to.have.been.calledOnce;
            expect(next).to.have.been.calledWith(err);
        });

        it('should redirect the user to the login page if the error is an authentication error', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.authenticationErrorHandler();

            var err = new InvalidSessionError('authentication error');
            var resourcePath = '/protected/home';
            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            req.path = resourcePath;
            handler(err, req, res, next);

            expect(res.redirect).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledWith('/auth/login?resource=' + resourcePath);
        });

        it('should default the login page url to "auth/login" if a valid login page is not specified', function() {
            function checkLoginPageDefault(loginPage) {
                var provider = new CoreHandlerProvider();
                var handler = provider.authenticationErrorHandler(loginPage);

                var err = new InvalidSessionError('authentication error');
                var resourcePath = '/protected/home';
                var req = _expressMocks.getMockReq();
                var res = _expressMocks.getMockRes();
                var next = _sinon.spy();

                req.path = resourcePath;
                handler(err, req, res, next);

                expect(res.redirect).to.have.been.calledOnce;
                expect(res.redirect).to.have.been.calledWith('/auth/login?resource=' + resourcePath);
            }

            checkLoginPageDefault(undefined);
            checkLoginPageDefault(null);
            checkLoginPageDefault(123);
            checkLoginPageDefault('');
            checkLoginPageDefault(true);
            checkLoginPageDefault([]);
            checkLoginPageDefault({});
            checkLoginPageDefault(function(){});
        });

        it('should use the optional login page url as the login page if one is specified', function() {
            var loginPage = '/portal/login';
            var provider = new CoreHandlerProvider();
            var handler = provider.authenticationErrorHandler(loginPage);

            var err = new InvalidSessionError('authentication error');
            var resourcePath = '/protected/home';
            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();

            req.path = resourcePath;
            handler(err, req, res, next);

            expect(res.redirect).to.have.been.calledOnce;
            expect(res.redirect).to.have.been.calledWith(loginPage + '?resource=' + resourcePath);
        });
    });

    describe('catchAllErrorHandler()', function() {
        it('should return a function when invoked', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.catchAllErrorHandler();

            expect(handler).to.be.a('function');
        });

        it('should set the status code to 500 when invoked', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.catchAllErrorHandler();

            var errorMessage = 'Something went wrong';
            var err = new Error(errorMessage);
            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            handler(err, req, res, next);

            expect(res.status).to.have.been.calledOnce;
            expect(res.status).to.have.been.calledWith(500);
        });

        it('should render the error page with the correct information', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.catchAllErrorHandler();

            var errorMessage = 'Something went wrong';
            var err = new Error(errorMessage);
            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            handler(err, req, res, next);

            expect(res.render).to.have.been.calledOnce;
            expect(res.render).to.have.been.calledWith('error');
            expect(res.render.args[0][1]).to.deep.equal({
                code: 500,
                primaryMessage: 'Oops. Something went wrong.',
                secondaryMessage: '',
                errorInfo: err.toString()
            });
        });

        it('should not call next()', function() {
            var provider = new CoreHandlerProvider();
            var handler = provider.catchAllErrorHandler();

            var errorMessage = 'Something went wrong';
            var err = new Error(errorMessage);
            var req = _expressMocks.getMockReq();
            var res = _expressMocks.getMockRes();
            var next = _sinon.spy();
            handler(err, req, res, next);

            expect(next).to.not.have.been.called;
        });
    });
});
