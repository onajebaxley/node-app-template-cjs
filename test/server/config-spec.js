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
var _config = null;

describe('[server.config]', function() {

    var _packageMock = null;
    var _rcSpy = null;
    var _rcOptions = null;

    function _setRcMock(options) {
        options = options || {};
        options.port = options.port || 3000;
        options.rootPath = options.rootPath || '/';
        options.proxyPresent = options.proxyPresent || false;
        options.sessionSecret = options.sessionSecret || 'secret';
        options.sessionSecureProxy = options.sessionSecureProxy || true;
        options.sessionCookieName = options.sessionCookieName || 'app_session';
        options.sessionTimeout = options.sessionTimeout || 10800000;
        options.sessionTokenVersion = options.sessionTokenVersion || 1;
        options.logsDir = options.logsDir || 'log';
        options.staticFileCacheDuration = options.staticFileCacheDuration || 31558464000;

        var rcSpy = _sinon.spy();

        function rcMock(name, defaults) {
            rcSpy(name, defaults);
            defaults = defaults || {};
            for (var prop in options) {
                defaults[prop] = options[prop];
            }
            return defaults;
        }

        _config.__set__('_rc', rcMock);
        return {
            spy: rcSpy,
            options: options
        };
    }

    beforeEach(function() {
        _config = _rewire('../../server/config');

        _packageMock = {
            name: 'foo-bar',
            version: '1.2.3',
            _rcName: 'foo_bar'
        };

        _config.__set__('_packageInfo', _packageMock);

        var ret = _setRcMock();
        _rcSpy = ret.spy;
        _rcOptions = ret.options;
    });

    afterEach(function() {});

    describe('[init]', function() {
        it('should expose the necessary fields and methods', function() {
            expect(_config).to.have.property('configure').and.to.be.a('function');
        });
    });

    describe('configure()', function() {
        it('should throw an error if invoked without a valid app object', function() {
            var error = 'Invalid app object specified (arg #1)';

            var invokeMethod = function(app) {
                return function() {
                    _config.configure(app);
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

        it('should load application configuration from the file system when invoked', function() {
            expect(_rcSpy).to.not.have.been.called;

            _config.configure(_appHelper.getMockApp());

            expect(_rcSpy).to.have.been.calledOnce;
            expect(_rcSpy).to.have.been.calledWith(_packageMock._rcName);
        });

        it('should set application parameters on the express object', function() {
            var app = _appHelper.getMockApp();

            var funcRef = app.set;
            var spy = _sinon.stub(app, 'set', function(key, value) {
                funcRef.call(app, key, value);
            });

            expect(spy).to.not.have.been.called;
            _config.configure(app);

            expect(spy).to.have.been.calledTwice;

            expect(spy.args[0][0]).to.equal('views');
            expect(spy.args[0][1]).to.equal(_path.join(__dirname, '../../server/views'));
        });

        it('should translate uppercase string values to boolean', function() {
            _configHelper.deleteConfig();
            _setRcMock({
                proxyPresent: 'TRUE',
                sessionSecureProxy: 'TRUE'
            });
            _config.configure(_appHelper.getMockApp({
                env: 'na'
            }));

            expect(GLOBAL.config.cfg_proxy_present).to.be.true;
            expect(GLOBAL.config.cfg_session_secure_proxy).to.be.true;
        });

        it('should initialize required configuration parameters when invoked (ENV=production)', function() {
            var appKeys = {
                env: 'production'
            };
            var app = _appHelper.getMockApp(appKeys);

            _configHelper.deleteConfig();
            _config.configure(app);

            expect(GLOBAL.config).to.be.an('object');

            expect(GLOBAL.config.views).to.equal(_path.join(__dirname, '../../server/views'));
            expect(GLOBAL.config['view engine']).to.equal('jade');

            expect(GLOBAL.config.cfg_env).to.equal(appKeys.env);
            expect(GLOBAL.config.cfg_app_name).to.equal(_packageMock.name);

            expect(GLOBAL.config.cfg_port).to.equal(_rcOptions.port);
            expect(GLOBAL.config.cfg_root_path).to.equal(_path.join(_rcOptions.rootPath));
            expect(GLOBAL.config.cfg_mount_path).to.equal(_rcOptions.rootPath);

            expect(GLOBAL.config.cfg_static_dir).to.equal(_path.join(__dirname, '../../client'));

            expect(GLOBAL.config.cfg_logs_dir).to.equal('log');
            expect(GLOBAL.config.cfg_proxy_present).to.equal(_rcOptions.proxyPresent);

            expect(GLOBAL.config.cfg_session_secret).to.equal(_rcOptions.sessionSecret);
            expect(GLOBAL.config.cfg_session_cookie_name).to.equal(_rcOptions.sessionCookieName);
            expect(GLOBAL.config.cfg_session_token_version).to.equal(_rcOptions.sessionTokenVersion);

            //Configuration settings for ENV=production
            expect(GLOBAL.config.cfg_app_version).to.equal(_packageMock.version);
            expect(GLOBAL.config.cfg_static_file_cache_duration).to.equal(_rcOptions.staticFileCacheDuration);
            expect(GLOBAL.config.cfg_enable_dyamic_js_compile).to.be.false;
            expect(GLOBAL.config.cfg_enable_dyamic_css_compile).to.be.false;
            expect(GLOBAL.config.cfg_enable_minified_files).to.be.true;
            expect(GLOBAL.config.cfg_session_secure_proxy).to.equal(_rcOptions.sessionSecureProxy);
            expect(GLOBAL.config.cfg_session_timeout).to.equal(_rcOptions.sessionTimeout);
        });

        it('should initialize required configuration parameters when invoked (ENV=test)', function() {
            var appKeys = {
                env: 'test'
            };
            var app = _appHelper.getMockApp(appKeys);

            _configHelper.deleteConfig();
            _config.configure(app);

            expect(GLOBAL.config).to.be.an('object');

            expect(GLOBAL.config.views).to.equal(_path.join(__dirname, '../../server/views'));
            expect(GLOBAL.config['view engine']).to.equal('jade');

            expect(GLOBAL.config.cfg_env).to.equal(appKeys.env);
            expect(GLOBAL.config.cfg_app_name).to.equal(_packageMock.name);

            expect(GLOBAL.config.cfg_port).to.equal(_rcOptions.port);
            expect(GLOBAL.config.cfg_root_path).to.equal(_path.join(_rcOptions.rootPath));
            expect(GLOBAL.config.cfg_mount_path).to.equal(_rcOptions.rootPath);

            expect(GLOBAL.config.cfg_static_dir).to.equal(_path.join(__dirname, '../../client'));

            expect(GLOBAL.config.cfg_logs_dir).to.equal('log');
            expect(GLOBAL.config.cfg_proxy_present).to.equal(_rcOptions.proxyPresent);

            expect(GLOBAL.config.cfg_session_secret).to.equal(_rcOptions.sessionSecret);
            expect(GLOBAL.config.cfg_session_cookie_name).to.equal(_rcOptions.sessionCookieName);
            expect(GLOBAL.config.cfg_session_token_version).to.equal(_rcOptions.sessionTokenVersion);

            //Configuration settings for ENV=test
            var versionPattern = new RegExp(_packageMock.version + '__[0-9]{13,13}');
            expect(GLOBAL.config.cfg_app_version).to.match(versionPattern);
            expect(GLOBAL.config.cfg_static_file_cache_duration).to.equal(0);
            expect(GLOBAL.config.cfg_enable_dyamic_js_compile).to.be.false;
            expect(GLOBAL.config.cfg_enable_dyamic_css_compile).to.be.false;
            expect(GLOBAL.config.cfg_enable_minified_files).to.be.true;
            expect(GLOBAL.config.cfg_session_secure_proxy).to.equal(_rcOptions.sessionSecureProxy);
            expect(GLOBAL.config.cfg_session_timeout).to.equal(_rcOptions.sessionTimeout);
        });

        it('should initialize required configuration parameters when invoked (ENV=development)', function() {
            var appKeys = {
                env: 'development'
            };
            var app = _appHelper.getMockApp(appKeys);

            _configHelper.deleteConfig();
            _config.configure(app);

            expect(app.locals.gv_config).to.be.an('object');
            expect(app.locals.gv_config.app_name).to.equal(GLOBAL.config.cfg_app_name);
            expect(app.locals.gv_config.app_title).to.equal(GLOBAL.config.cfg_app_title);
            expect(app.locals.gv_config.app_version).to.equal(GLOBAL.config.cfg_app_version);
            expect(app.locals.gv_config.root_path).to.equal(GLOBAL.config.cfg_root_path);
        });

        it('should initialize config elements that can be injected into the client', function() {
            var appKeys = {
                env: 'development'
            };
            var app = _appHelper.getMockApp(appKeys);

            _configHelper.deleteConfig();
            _config.configure(app);

            expect(GLOBAL.config).to.be.an('object');

            expect(GLOBAL.config.views).to.equal(_path.join(__dirname, '../../server/views'));
            expect(GLOBAL.config['view engine']).to.equal('jade');

            expect(GLOBAL.config.cfg_env).to.equal(appKeys.env);
            expect(GLOBAL.config.cfg_app_name).to.equal(_packageMock.name);

            expect(GLOBAL.config.cfg_port).to.equal(_rcOptions.port);
            expect(GLOBAL.config.cfg_root_path).to.equal(_path.join(_rcOptions.rootPath));
            expect(GLOBAL.config.cfg_mount_path).to.equal(_rcOptions.rootPath);

            expect(GLOBAL.config.cfg_static_dir).to.equal(_path.join(__dirname, '../../client'));

            expect(GLOBAL.config.cfg_logs_dir).to.equal('log');
            expect(GLOBAL.config.cfg_proxy_present).to.equal(_rcOptions.proxyPresent);

            expect(GLOBAL.config.cfg_session_secret).to.equal(_rcOptions.sessionSecret);
            expect(GLOBAL.config.cfg_session_cookie_name).to.equal(_rcOptions.sessionCookieName);
            expect(GLOBAL.config.cfg_session_token_version).to.equal(_rcOptions.sessionTokenVersion);

            //Configuration settings for ENV=development
            var versionPattern = new RegExp(_packageMock.version + '__[0-9]{13,13}');
            expect(GLOBAL.config.cfg_app_version).to.match(versionPattern);
            expect(GLOBAL.config.cfg_static_file_cache_duration).to.equal(0);
            expect(GLOBAL.config.cfg_enable_dyamic_js_compile).to.be.true;
            expect(GLOBAL.config.cfg_enable_dyamic_css_compile).to.be.true;
            expect(GLOBAL.config.cfg_enable_minified_files).to.be.false;
            expect(GLOBAL.config.cfg_session_secure_proxy).to.equal(false);
            expect(GLOBAL.config.cfg_session_timeout).to.equal(900 * 1000);
        });


        it('should use the rootPath parameter as the mount path if no proxy is present', function() {
            _configHelper.deleteConfig();
            var rootPath = '/root/path/123';
            _setRcMock({
                rootPath: rootPath,
                proxyPresent: 'false'
            });
            _config.configure(_appHelper.getMockApp({
                env: 'production'
            }));

            expect(GLOBAL.config.cfg_mount_path).to.equal(rootPath);
        });

        it('should use "/" as the rootPath parameter as the mount path if a proxy is present', function() {
            _configHelper.deleteConfig();
            var rootPath = '/root/path/123';
            _setRcMock({
                rootPath: rootPath,
                proxyPresent: 'true'
            });
            _config.configure(_appHelper.getMockApp({
                env: 'production'
            }));

            expect(GLOBAL.config.cfg_mount_path).to.equal('/');
        });

        it('should have no impact if invoked multiple times', function() {
            _config.configure(_appHelper.getMockApp());
            _rcSpy.reset();

            _config.configure(_appHelper.getMockApp());
            expect(_rcSpy).to.not.have.been.called;
        });
    });
});
