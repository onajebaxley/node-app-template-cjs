/* jshint node:true */
'use strict';

var _fs = require('fs');
var _promise = require('wysknd-lib').promise;
var _utils = require('wysknd-lib').utils;
var _folder = require('wysknd-lib').folder;

// -------------------------------------------------------------------------------
//  Help documentation
// -------------------------------------------------------------------------------
var HELP_TEXT =
'--------------------------------------------------------------------------------\n' +
' Defines tasks that are commonly used during the development process. This      \n' +
' includes tasks for linting, building and testing.                              \n' +
'                                                                                \n' +
' Supported Tasks:                                                               \n' +
'   [default]         : Performs standard pre-commit/push activities. Runs       \n' +
'                       jsbeautifier on all source files (html and css files are \n' +
'                       also beautified), then runs jshint, and then executes all\n' +
'                       tests against the source files. Consider executing       \n' +
'                       the test:all:dev task as well to ensure that the         \n' +
'                       development workflow is not broken.                      \n' +
'                                                                                \n' +
'   fs                : Provides information regarding the current project       \n' +
'                       structure This an information only task that does not    \n' +
'                       alter any file/folder in the project.                    \n' +
'                                                                                \n' +
'   help              : Shows this help message.                                 \n' +
'                                                                                \n' +
'   clean             : Cleans out all build artifacts and other temporary files \n' +
'                       or directories.                                          \n' +
'                                                                                \n' +
'   monitor:[opt1]:   : Monitors files for changes, and triggers actions based   \n' +
'           [opt2]:     on specified options. Supported options are as follows:  \n' +
'           [opt3]:       [lint]   : Executes jshint with default options against\n' +
'           [opt4]:                  all source files.                           \n' +
'           [opt5]:       [client] : Executes client side unit tests against all \n' +
'           [opt6]                   source files.                               \n' +
'                         [server] : Executes server side unit tests against all \n' +
'                                    server source files.                        \n' +
'                         [http]   : Executes http request test against server   \n' +
'                                    routes. This task will automatically launch \n' +
'                                    the web server prior to running the tests,  \n' +
'                                    and shutdown the server after the tests have\n' +
'                                    been executed.                              \n' +
'                         [e2e]    : Executes end to end tests against all source\n' +
'                                    files. This task will automatically launch  \n' +
'                                    the web server prior to running tests, and  \n' +
'                                    shut down the server after the tests have   \n' +
'                                    been executed.                              \n' +
'                         [build]  : Performs a full build/test cycle. This      \n' +
'                                    includes linting, building and testing of   \n' +
'                                    all build artifacts (unit and e2e). If this \n' +
'                                    task is specified, all others will be       \n' +
'                                    ignored.                                    \n' +
'                                                                                \n' +
'                       Multiple options may be specified, and the triggers will \n' +
'                       be executed in the order specified. If a specific task   \n' +
'                       requires a web server to be launched, this will be done  \n' +
'                       automatically.                                           \n' +
'                       An exception to the above statement is when client       \n' +
'                       testing is chosen as the post change action. Client tests\n' +
'                       cannot be combined with any other task, and will run     \n' +
'                       individually.                                            \n' +
'                                                                                \n' +
'   lint              : Executes jshint against all source files.                \n' +
'   pretty            : Beautifies all javascript files in the project.          \n' +
'                                                                                \n' +
'   build:[debugMode] : Builds all of the source files and deploys the results   \n' +
'                       to the build folder. If the "debugMode" sub target is    \n' +
'                       specified, or, the --debug-mode option is specified, the \n' +
'                       build will be executed without any optimization. In      \n' +
'                       addition to speeding up the build process, this option   \n' +
'                       has the effect of making the build artifact easier to    \n' +
'                       read and troubleshoot.                                   \n' +
'                                                                                \n' +
'   test:[client|http : Executes tests against source files or build artifacts.  \n' +
'     server|e2e|all]:  The type of test to execute is specified by the first    \n' +
'        [dev|build]    sub target (client/server/http/e2e/all), and the files to\n' +
'                       test (dev/build) is specified by the second subtarget.   \n' +
'                       The first sub target is mandatory.                       \n' +
'                       If the "build" subtarget is specified, sources must      \n' +
'                       already be built and ready for testing int the build     \n' +
'                       directory.                                               \n' +
'                       If required by the tests, an instance of express will be \n' +
'                       started prior to executing the tests.                    \n' +
'                       If [all] is used as the test type, all four tests        \n' +
'                       (client, server, http and e2e) wll be executed.          \n' +
'                                                                                \n' +
'   bump:[major|minor]: Updates the version number of the package. By default,   \n' +
'                       this task only increments the patch version number. Major\n' +
'                       and minor version numbers can be incremented by          \n' +
'                       specifying the "major" or "minor" subtask.               \n' +
'                                                                                \n' +
'   package           : Prepares the application for deployment by creating a    \n' +
'                       distribution package.                                    \n' +
'                                                                                \n' +
' Supported Options:                                                             \n' +
'   --debug-mode      : When set to true, forces builds to take place in debug   \n' +
'                       mode (no minification). This option overrides settings   \n' +
'                       from sub targets.                                        \n' +
'   --no-server       : When set to true, does not launch an express instance    \n' +
'                       prior to running tests, even if the tests require an     \n' +
'                       express instance to be present. In such cases, it is     \n' +
'                       the user\'s responsibility to make sure that an express  \n' +
'                       is running for the test suite.                           \n' +
'                                                                                \n' +
' IMPORTANT: Please note that while the grunt file exposes tasks in addition to  \n' +
' ---------  the ones listed below (no private tasks in grunt yet :( ), it is    \n' +
'            strongly recommended that just the tasks listed below be used       \n' +
'            during the dev/build process.                                       \n' +
'                                                                                \n' +
'--------------------------------------------------------------------------------';
module.exports = function(grunt) {
    /* ------------------------------------------------------------------------
     * Initialization of dependencies.
     * ---------------------------------------------------------------------- */
    //Time the grunt process, so that we can understand time consumed per task.
    require('time-grunt')(grunt);

    //Load all grunt tasks by reading package.json.
    require('load-grunt-tasks')(grunt);

    /* ------------------------------------------------------------------------
     * Build configuration parameters
     * ---------------------------------------------------------------------- */
    var packageConfig = grunt.file.readJSON('package.json') || {};

    var PRJ_FS = {
        appName: packageConfig.name || '__UNKNOWN__',
        appVersion: packageConfig.version || '__UNKNOWN__',
        tree: {                             /* ------------------------------ */
                                            /* <ROOT>                         */
            'server': {                     /*  |--- server                   */
                'views': null,              /*  |   |--- views                */
                'routes': null              /*  |   |--- routes               */
            },                              /*  |                             */
            'client': {                     /*  |--- client                   */
                'css': null,                /*  |   |--- css                  */
                'js': null,                 /*  |   |--- js                   */
                'img': null,                /*  |   |--- img                  */
                'lib': null                 /*  |   |--- lib                  */
            },                              /*  |                             */
            'test': {                       /*  |--- test                     */
                'client': null,             /*  |   |--- client               */
                'e2e': null,                /*  |   |--- e2e                  */
                'server': null,             /*  |   |--- server               */
                'http': null                /*  |   |--- http                 */
            },                              /*  |                             */
            'logs': null,                   /*  |--- logs                     */
            'working': {                    /*  |--- working                  */
                'server': {                 /*  |   |--- server               */
                    'views': null,          /*  |   |   |--- views            */
                    'routes': null          /*  |   |   |--- routes           */
                },                          /*  |   |                         */
                'client': {                 /*  |   |--- client               */
                    'css': null,            /*  |   |   |--- css              */
                    'js': null,             /*  |   |   |--- js               */
                    'img': null,            /*  |   |   |--- img              */
                    'lib': null,            /*  |   |   |--- lib              */
                    'views': null           /*  |   |   |--- views            */
                }                           /*  |   |                         */
            },                              /*  |   |                         */
            'coverage': null,               /*  |   |--- coverage             */
            'dist': null,                   /*  |   |--- dist                 */
            '.sass-cache': null,            /*  |   |--- .sass-cache          */
        }                                   /* ------------------------------ */
    };

    PRJ_FS.ROOT = _folder.createFolderTree('./', PRJ_FS.tree);
    PRJ_FS.bannerText = '/*! [' + PRJ_FS.appName + ' v' + PRJ_FS.appVersion +
                   '] Built: <%= grunt.template.today("yyyy-mm-dd HH:MM a") %> */\n';
    PRJ_FS.publishArchive = PRJ_FS.appName + '_' + PRJ_FS.appVersion + '.zip';

    // This is the root url prefix for the app, and represents the path
    // (relative to root), where the app will be available.
    // This value should remain unchanged if the app does not sit behind a
    // proxy. If a proxy is present (that routes to the app based on URL
    // values), this value should be tweaked to include the proxy path.
    PRJ_FS.proxyPrefix = ''; //+ PRJ_FS.appName;

    (function _createTreeRefs(parent, subTree) {
        for(var folder in subTree) {
            var folderName = folder.replace('.', '_');
            parent[folderName] = parent.getSubFolder(folder);

            var children = subTree[folder];
            if(typeof children === 'object') {
                _createTreeRefs(parent[folder], children);
            }
        }
    })(PRJ_FS.ROOT, PRJ_FS.tree);

    // Shorthand references to key folders.
    var SERVER = PRJ_FS.ROOT.server;
    var CLIENT = PRJ_FS.ROOT.client;
    var TEST = PRJ_FS.ROOT.test;
    var LOGS = PRJ_FS.ROOT.logs;
    var DIST = PRJ_FS.ROOT.dist;
    var WORKING = PRJ_FS.ROOT.working;
    var SERVER_BUILD = WORKING.server;
    var CLIENT_BUILD = WORKING.client;

    var KARMA_PREPROC = {};
    KARMA_PREPROC[TEST.client.getChildPath('**/*.js')] = [ 'browserify' ];

    KARMA_PREPROC[CLIENT.js.getChildPath('**/*.html')] = [ 'ng-html2js' ];
    KARMA_PREPROC[CLIENT.js.getChildPath('app.js')] = [ 'browserify' ];

    /* ------------------------------------------------------------------------
     * Grunt task configuration
     * ---------------------------------------------------------------------- */
    grunt.initConfig({
        /**
         * Configuration for grunt-contrib-clean, which is used to:
         *  - Remove temporary files and folders.
         */
        clean: {
            dist: [ DIST.getPath() ],
            working: [ WORKING.getPath() ],
            sassCache: [ PRJ_FS.ROOT['_sass-cache'].getPath() ],
            coverage: [ PRJ_FS.ROOT.coverage.getPath() ],
            logs: [ LOGS.getChildPath('*') ],
            workingJs: {
                src: [ CLIENT_BUILD.js.allFilesPattern() ],
                filter: function(path) {
                    return !path.match(/(app.min.js$)/);
                }
            },
            workingStyles: {
                src: [ CLIENT_BUILD.css.allFilesPattern() ],
                filter: function(path) {
                    return !path.match(/app.min.css$/);
                }
            },
            workingLib: {
                src: [ CLIENT_BUILD.lib.allFilesPattern() ],
                filter: function(path) {
                    // Delete everything except for files that will
                    // be required in a production deployment.
                    return  !path.match(/\/lib\/font-awesome$/i) &&
                            !path.match(/\/lib\/font-awesome\/fonts($|\/.*\.(woff|woff2|ttf|svg|eot|otf)$)/i) &&
                            !path.match(/\/lib\/font-awesome\/css($|\/.*\.min\.css$)/i) &&

                            !path.match(/\/lib\/material-design-icons$/i) &&
                            !path.match(/\/lib\/material-design-icons\/iconfont($|\/.*\.css$)/i) &&
                            !path.match(/\/lib\/material-design-icons\/iconfont($|\/.*\.(woff|woff2|ttf|svg|eot|otf|ijmap)$)/i) &&

                            true;
                }
            },
            workingViews: {
                src: [ CLIENT_BUILD.views.allFilesPattern() ]
            }
        },

        /**
         * Configuration for grunt-contrib-copy, which is used to:
         *  - Copy files to a distribution folder during build.
         */
        copy: {
            compile: {
                files: [ {
                    expand: true,
                    cwd: SERVER.getPath(),
                    src: ['**'],
                    dest: SERVER_BUILD.getPath()
                }, {
                    expand: true,
                    cwd: CLIENT.getPath(),
                    src: ['**'],
                    dest: CLIENT_BUILD.getPath()
                }, {
                    expand: true,
                    cwd: PRJ_FS.ROOT.getPath(),
                    src: [ LOGS.getChildPath('.keep') ],
                    dest: WORKING.getPath()
                }, {
                    expand: true,
                    cwd: PRJ_FS.ROOT.getPath(),
                    src: ['.ebextensions/**'],
                    dest: WORKING.getPath()
                }, {
                    expand: false,
                    cwd: PRJ_FS.ROOT.getPath(),
                    src: ['package.json'],
                    dest: WORKING.getPath()
                }, {
                    expand: false,
                    cwd: PRJ_FS.ROOT.getPath(),
                    src: ['server.js'],
                    dest: WORKING.getPath()
                } ]
            }
        },

        /**
         * Configuration for grunt-contrib-concat, which is used to:
         *  - Combine one or more files into a single file.
         */
        concat: {
            options: {},
            css: {
                src: CLIENT_BUILD.css.allFilesPattern('css'),
                dest: CLIENT_BUILD.css.getChildPath('app.min.css')
            }
        },

        /**
         * Configuration for grunt-contrib-compress, which is used to:
         *  - Create compressed archives of build artifacts.
         */
        compress: {
            options: {},
            default: {
                options: {
                    mode: 'zip',
                    archive: DIST.getChildPath(PRJ_FS.publishArchive)
                },
                files: [ {
                    cwd: WORKING.getPath(),
                    // .ebextensions is for elastic beanstalk. If the directory
                    // does not exists, this will have no impact.
                    src: [ '**/*', '.ebextensions/*' ],
                    expand: true
                } ]
            }
        },

        /**
         * Configuration for grunt-angular-templates, which is used to:
         *  - Compile all angular.js templates (html files) into .js files
         *  - Attach the compiled templates to a specified module.
         * NOTE: Every module included in the app must contain a corresponding
         * entry in this task to ensure that the templates are compiled.
         */
        ngtemplates: {
            options: {
                module: 'app',
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                // Wrap the compiled templates in a common JS wrapper
                bootstrap: function(module, script) {
                    return '\'use strict\';\n' +
                            'var angular = require(\'angular\');\n' +
                            'var moduleName = \'templates\';\n' +
                            'angular.module(moduleName, [])\n' +
                            '  .run([ \'$templateCache\', function($templateCache) {\n' +
                            script +
                            '  }]);\n' +
                            'module.exports = moduleName;\n';
                },
                prefix: PRJ_FS.proxyPrefix + '/'
            },
            compile: {
                cwd: CLIENT.getPath(),
                src: [ 'js/**/*.html', 'views/**/*.html' ],
                dest: CLIENT_BUILD.js.getChildPath('templates.js'),
                append: true
            }
        },

        /**
         * Configuration for grunt-browserify, which is used to:
         *  - Combine all CommonJS modules for the browser into a single
         *    javascript file.
         */
        browserify: {
            compile: {
                src: CLIENT_BUILD.js.getChildPath('app.js'),
                dest: CLIENT_BUILD.js.getChildPath('app.min.js'),
                options: { }
            }
        },

        /**
         * Configuration for grunt-contrib-uglify, which is used to:
         *  - Minify the compiled application js file
         */
        uglify: {
            compile: {
                files: [{
                    src: CLIENT_BUILD.js.getChildPath('app.min.js'),
                    dest: CLIENT_BUILD.js.getChildPath('app.min.js')
                }]
            }
        },

        /**
         * Configuration for grunt-karma, which is used to:
         *  - Execute unit tests against all client side javascript code
         */
        karma: {
            options: {
                frameworks: ['mocha', 'browserify'],
                preprocessors: KARMA_PREPROC,
                browserify: {
                    debug: true,
                    transform: ['browserify-istanbul']
                },
                ngHtml2JsPreprocessor: {
                    stripPrefix: 'client',
                    prependPrefix: PRJ_FS.proxyPrefix,
                    moduleName: 'karma_templates'
                },
                coverageReporter: {
                    reporters: [
                        { type: 'html' },
                        { type: 'text' }
                    ]
                },

                basePath: '',
                port: 9999,
                logLevel: 'ERROR',
                singleRun: true,
                autoWatch: false,
                background: false,
                browsers: ['PhantomJS'],
                reporters: ['mocha', 'coverage'],
                colors: true
            },
            monitor: {
                options: {
                    files: [
                        // We need to load angularjs (even though it is bundled via
                        // browserify), because the javascript generated by ng-html2js
                        // needs it.
                        'node_modules/angular/angular.js',
                        { pattern: CLIENT.js.allFilesPattern('html'), included: true },
                        { pattern: TEST.client.allFilesPattern('js'), included: true },
                        { pattern: CLIENT.js.getChildPath('app.js'), included: true }
                    ],
                    singleRun: false,
                    autoWatch: true
                }
            },
            dev: {
                options: {
                    files: [
                        // We need to load angularjs (even though it is bundled via
                        // browserify), because the javascript generated by ng-html2js
                        // needs it.
                        'node_modules/angular/angular.js',
                        { pattern: CLIENT.js.allFilesPattern('html'), included: true },
                        { pattern: TEST.client.allFilesPattern('js'), included: true },
                        { pattern: CLIENT.js.getChildPath('app.js'), included: true }
                    ]
                }
            },
            build: {
                options: {
                    files: [
                        { pattern: TEST.client.allFilesPattern('js'), included: true },
                        { pattern: CLIENT_BUILD.js.getChildPath('app.min.js'), included: true}
                    ]
                }
            }
        },

        /**
         * Configuration for grunt-mocha-istanbul, which is used to:
         *  - Execute server side node.js tests
         *  - Test web server API by making http requests to the server
         *  - Provide code coverage information
         */
        mocha_istanbul: {
            options: {
                reportFormats: [ 'text', 'html' ],
                reporter: 'spec',
                timeout: 8000,
                colors: true
            },
            default: [ TEST.server.allFilesPattern('js') ]
        },

        /**
        * Configuration for grunt-mocha-test, which is used to:
        *  - Test web server API by making http requests to the server
        */
        mochaTest: {
            options: {
                reporter: 'spec',
                timeout: 8000,
                colors: true
            },
            default: [ TEST.http.allFilesPattern('js') ]
        },

        /**
         * Configuration for grunt-protractor-runner, which is used to:
         *  - Execute end to end tests on the application.
         */
        protractor: {
            options: {
                keepAlive: false,
                noColor: false,
                args: {
                    // If the args are overridden in child targets, *all*
                    // properties of the args are overridden. It does not
                    // perform a merge.
                    framework: ['mocha'],
                    mochaOpts: {
                        reporter: 'spec',
                        slow: 2000,
                        timeout: 10000
                    },
                    browser: 'chrome',
                    specs: [ TEST.e2e.allFilesPattern('js') ],
                    exclude: [ TEST.e2e.getChildPath('conf/*') ],
                    chromeDriver: './node_modules/grunt-protractor-runner/node_modules/protractor/selenium/chromedriver'
                },
                configFile: TEST.e2e.getChildPath('conf/default.js')
            },
            default: {}
        },

        /**
         * Configuration for grunt-contrib-compass, which is used to:
         *  - Convert all SASS files into css files.
         */
        compass: {
            options: {
                importPath: CLIENT_BUILD.css.getPath(),
                relativeAssets: true,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\n'
            },
            compile: {
                options: {
                    sassDir: CLIENT_BUILD.css.getPath(),
                    cssDir: CLIENT_BUILD.css.getPath()
                }
            }
        },

        /**
         * Configuration for grunt-contrib-cssmin, which is used to:
         *  - Combine and minify one or more css files into a single css file.
         */
        cssmin: {
            options: {
                banner: PRJ_FS.bannerText
            },
            compile: {
                src: CLIENT_BUILD.css.getChildPath('app.min.css'),
                dest: CLIENT_BUILD.css.getChildPath('app.min.css')
            }
        },

        /**
         * Configuration for grunt-jsbeautifier, which is used to:
         *  - Beautify all javascript, html and css files  prior to commit/push.
         */
        jsbeautifier: {
            dev: [ SERVER.allFilesPattern('js'),
                    CLIENT.css.allFilesPattern('css'),
                    CLIENT.js.allFilesPattern('html'),
                    '!' + CLIENT.lib.allFilesPattern(),
                    TEST.allFilesPattern('js') ]
        },

        /**
         * Configuration for grunt-prettysass, which is used to:
         *  - Beautify all SASS files
         */
        prettysass: {
            options: {
                indent: 4
            },
            dev: {
                src: [ CLIENT.css.allFilesPattern('scss') ]
            }
        },

        /**
         * Configuration for grunt-contrib-watch, which is used to:
         *  - Monitor all source/test files and trigger actions when these
         *    files change.
         */
        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true
            },
            dev: [ 'Gruntfile.js',
                    SERVER.allFilesPattern('js'),
                    '!' + CLIENT.lib.allFilesPattern(),
                    TEST.allFilesPattern('js') ]
        },

        /**
         * Configuration for grunt-contrib-watch, which is used to:
         *  - Monitor all source/test files and trigger actions when these
         *    files change.
         */
        watch: {
            allSources: {
                files: [ SERVER.allFilesPattern(), CLIENT.allFilesPattern(), TEST.allFilesPattern() ],
                tasks: [ ]
            }
        },

        /**
         * Configuration for grunt-express-server, which is used to:
         *  - Start an instance of the express server for the purposes of
         *    running tests.
         */
        express: {
            options: {
                debug: true
            },
            dev: {
                options: {
                    node_env: 'development',
                    script: SERVER.getChildPath('server.js')
                }
            },
            build: {
                options: {
                    node_env: 'test',
                    script: SERVER_BUILD.getChildPath('server.js')
                }
            }
        },

        /**
         * Configuration for grunt-bump, which is used to:
         *  - Update the version number on package.json
         */
        bump: {
            options: {
                push: false
             }
        },

        /**
         * Configuration for grunt-env, which is used to:
         *  - Set or unset environment variables
         */
        env: {
            dev: {
                TEST_MODE: 'dev'
            },
            build: {
                TEST_MODE: 'build'
            }
        }

    });

    /* ------------------------------------------------------------------------
     * Task registrations
     * ---------------------------------------------------------------------- */

    /**
     * Default task. Performs default tasks prior to commit/push, including:
     *  - Beautifying files
     *  - Linting files
     *  - Building sources
     *  - Testing build artifacts
     *  - Cleaning up build results
     */
    grunt.registerTask('default', ['jsbeautifier:dev',
                                    'prettysass:dev',
                                    'jshint:dev',
                                    'build',
                                    'test:client:build',
                                    'test:server:build',
                                    'test:e2e:build',
                                    'clean' ]);

    /**
     * Create distribution package task. Creates a new distribution of the app,
     * ready for deployment.
     */
    grunt.registerTask('package', ['jsbeautifier:dev',
                                 'prettysass:dev',
                                 'jshint:dev',
                                 'build',
                                 'test:client:build',
                                 'test:server:build',
                                 'test:e2e:build',
                                 'compress:default' ]);

    /**
     * Test task - executes client only tests, server only tests or end to end
     * tests based on the test type passed in. Tests may be executed against
     * dev code or build artifacts.
     */
    grunt.registerTask('test',
        'Executes tests (client/http/server/e2e) against sources or build artifacts',
        function(testType, target) {
            var testAction;
            var startServer = false;

            target = target || 'dev';

            if(testType === 'client') {
                if(target !== 'dev' && target !== 'build' && target !== 'monitor') {
                    grunt.log.warn('The target [' +
                                    target +
                                    '] is not applicable for client testing');
                } else {
                    testAction = 'karma:' + target;
                }
            } else if(testType === 'server') {
                testAction = 'mocha_istanbul:default';
            } else if(testType === 'http') {
                testAction = 'mochaTest:default';
                startServer = true;
            } else if(testType === 'e2e') {
                testAction = 'protractor:default';
                startServer = true;
            }
            startServer = startServer && !grunt.option('no-server');
            if(target !== 'monitor') {
                grunt.task.run('env:' + target);
            } else {
                grunt.task.run('env:dev');
            }

            if(testAction) {
                if(startServer) {
                    grunt.task.run('express:' + target);
                }
                grunt.task.run(testAction);
                if(startServer) {
                    grunt.task.run('express:' + target + ':stop');
                }
            } else if(testType === 'all') {
                grunt.task.run('test:client:' + target);
                grunt.task.run('test:server:' + target);
                grunt.task.run('test:http:' + target);
                grunt.task.run('test:e2e:' + target);
            } else {
                grunt.log.warn('Unrecognized test type or target. Please see help (grunt help) for task usage information');
            }
        }
    );


    // Monitor task - track changes on different sources, and enable auto
    // execution of tests if requested.
    //  - If no arguments are specified, just launch web server with auto
    //    refresh capabilities.
    //  - If arguments are specified (see help) execute the necessary actions
    //    on changes.
    grunt.registerTask('monitor',
        'Monitors source files for changes, and performs actions as necessary',
        function() {
            var tasks = [];
            var runClientTests = false;

            var serverMode = grunt.option('serverMode') || 'dev';
            // Process the arguments (specified as subtasks).
            for (var index = 0; index < arguments.length; index++) {
                var arg = arguments[index];
                var task = null;

                if (arg === 'lint') {
                    tasks.push('jshint:dev');

                } else if ('client' === arg) {
                    grunt.log.warn('When client side tests are chosen, monitoring will not run any other tasks');
                    tasks.slice(0, 0);
                    tasks.push('test:client:monitor');
                    runClientTests = true;
                    break;

                } else if ('http' === arg) {
                    tasks.push('test:http:' + serverMode);

                } else if ('server' === arg) {
                    tasks.push('test:server:' + serverMode);

                } else if ('e2e' === arg) {
                    tasks.push('test:e2e:' + serverMode);

                } else if ('build' === arg) {
                    grunt.log.warn('When the build subtask is specified, all other task options will be ignored');
                    tasks.slice(0, 0);
                    tasks.push('jshint:dev');
                    tasks.push('build');
                    tasks.push('test:client:build');
                    tasks.push('test:server:build');
                    tasks.push('test:http:build');
                    tasks.push('test:e2e:build');
                    break;

                } else {
                    // Unrecognized argument.
                    grunt.log.warn('Unrecognized argument: %s', arg);
                }
            }

            grunt.log.writeln('Tasks to run on change: [' + tasks + ']');
            if(runClientTests) {
                tasks.forEach(function(task) {
                    grunt.task.run(task);
                });
            } else if(tasks.length > 0) {
                grunt.config.set('watch.allSources.tasks', tasks);
                grunt.task.run('watch:allSources');
            } else {
                grunt.log.error('No tasks specified to execute on change');
            }
        }
    );

    /**
     * Build task - performs a compilation on all source files
     *  - Combines and compresses all client side .js files
     *  - Compiles angular.js html templates
     *  - Compiles all stylesheet files from .scss to .css
     */
    grunt.registerTask('build',
        'Performs a full build of all source files, preparing it for packaging/publication',
        function(target) {
            var isDebugMode = grunt.option('debug-mode') || (target === 'debug-mode');
            if(isDebugMode) {
                grunt.log.writeln('Executing build in debug mode');
            }

            grunt.task.run('clean:dist');
            grunt.task.run('clean:working');
            grunt.task.run('copy:compile');
            grunt.task.run('ngtemplates:compile');
            grunt.task.run('browserify:compile');
            grunt.task.run('compass:compile');
            grunt.task.run('concat:css');
            if(!isDebugMode) {
                grunt.task.run('uglify:compile');
                grunt.task.run('cssmin:compile');
            }

            grunt.task.run('clean:workingJs');
            grunt.task.run('clean:workingStyles');
            grunt.task.run('clean:sassCache');
            grunt.task.run('clean:coverage');
            grunt.task.run('clean:workingLib');
            grunt.task.run('clean:workingViews');
        }
    );

    /**
     * Shows the current file structure setup.
     */
    grunt.registerTask('fs',
        'Shows the current project file structure',
        function() {
            var separator = new Array(80).join('-');
            function _showRecursive(root, indent) {
                var indentChars = '  ';
                if(!indent) {
                    indent = 0;
                } else  {
                    indentChars += '|';
                }
                indentChars += new Array(indent).join(' ');
                indentChars += '|--- ';
                var hasChildren = false;
                for(var prop in root) {
                    var member = root[prop];
                    if(typeof member === 'object') {
                        var maxLen = 74 - (indentChars.length + prop.length);
                        var status = _utils.padLeft(member.getStatus(), maxLen);

                        grunt.log.writeln(indentChars + prop + status);
                        hasChildren = true;
                        if(_showRecursive(member, indent + 4)) {
                            grunt.log.writeln('  |');
                        }
                    }
                }

                return hasChildren;
            }

            grunt.log.writeln('\n' + separator);
            _showRecursive(PRJ_FS.ROOT, 0);
            grunt.log.writeln(separator + '\n');
        }
    );

    /**
     * Shows help information on how to use the Grunt tasks.
     */
    grunt.registerTask('help',
        'Displays grunt help documentation',
        function(){
            grunt.log.writeln(HELP_TEXT);
        }
    );

    /**
     * Alias for the jsbeautifier task.
     */
    grunt.registerTask('pretty', [ 'jsbeautifier:dev' ]);

    /**
     * Alias for the jshint task.
     */
    grunt.registerTask('lint', [ 'jshint:dev' ]);
};
