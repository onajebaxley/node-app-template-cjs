/* jshint node:true, expr:true */
'use strict';

var _path = require('path');
var _supertest = require('supertest');
var _clone = require('clone');

var _chai = require('chai');
var expect = require('chai').expect;

/**
 * Class that represents a helper object that can be used to perform http
 * tests.
 *
 * @class HttpHelper
 * @constructor
 * @param {String} baseUrl The base url used for all requests.
 * @param {String} [basePath=/] An optional base path that will be prepended
 *          to all paths specified during testing.
 */
function HttpHelper(baseUrl, basePath) {
    if(typeof baseUrl !== 'string' || baseUrl.length <= 0) {
        throw new Error('Invalid base url specified (arg #1)');
    }
    if(typeof basePath !== 'string' || basePath.length <= 0) {
        basePath = '/';
    }
    this._baseUrl = baseUrl;
    this._basePath = basePath;
}

/**
 * @class HttpHelper
 * @method _ensureOptions
 * @private
 */
HttpHelper.prototype._ensureOptions = function(options, code, headers) {
    options = _clone(options);
    code = code || 200;
    headers = headers || {};
    if(!options || typeof options !== 'object') {
        options = {};
    }

    if(typeof options.code !== 'number' || options.code < 0) {
        options.code = code;
    }

    if(!options.headers || typeof options.headers !== 'object') {
        options.headers = {};
    }

    for(var name in headers) {
        if(options.headers[name] === undefined) {
            options.headers[name] = headers[name];
        }
    }

    if(typeof options.finish !== 'function') {
        options.finish = function(err, res) {
            expect(err).to.be.null;
        };
    }

    return options;
};

/**
 * @class HttpHelper
 * @method _test
 * @private
 */
HttpHelper.prototype._test = function(verb, path, done, options) {
    if(typeof verb !== 'string' || verb.length <= 0) {
        throw new Error('Invalid verb specified (arg #1)');
    }
    if(typeof path !== 'string' || path.length <= 0) {
        throw new Error('Invalid path specified (arg #2)');
    }
    if(typeof done !== 'function') {
        throw new Error('Invalid callback specified (arg #3)');
    }

    options = this._ensureOptions(options);
    var requestPath = _path.join(this._basePath, path);

    var handler = _supertest(this._baseUrl);
    handler = handler[verb](requestPath).expect(options.code);
    for(var name in options.headers) {
        handler = handler.expect(name, options.headers[name]);
    }
    handler.end(function(err, res) {
        options.finish(err, res);
        done();
    });
};

/**
 * Performs an http test on a get request to the specified url.
 *
 * @class HttpHelper
 * @method testGet
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 * @param {Object} [options] An optional options object that can contain
 *          additional testing parameters - expected http response code,
 *          headers, etc.
 */
HttpHelper.prototype.testGet = function(path, done, options) {
    this._test('get', path, done, options);
};

/**
 * Performs an http test on a get request for a resource that has been moved.
 *
 * @class HttpHelper
 * @method test302
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 */
HttpHelper.prototype.test302 = function(path, location, done) {
    this._test('get', path, done, {
        code: 302,
        headers: {
            'content-type': /text\/plain/,
            'location': location
        }
    });
};

/**
 * Performs an http test on a get request for a resource that does not exist.
 *
 * @class HttpHelper
 * @method test404
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 */
HttpHelper.prototype.test404 = function(path, done) {
    this._test('get', path, done, {
        code: 404,
        headers: {
            'content-type': /text\/html/
        }
    });
};

/**
 * Performs an http test on a get request to a html resource.
 *
 * @class HttpHelper
 * @method testHtml
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 */
HttpHelper.prototype.testHtml = function(path, done) {
    this._test('get', path, done, {
        code: 200,
        headers: {
            'content-type': /text\/html/
        }
    });
};

/**
 * Performs an http test on a get request to a css resource.
 *
 * @class HttpHelper
 * @method testCss
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 */
HttpHelper.prototype.testCss = function(path, done) {
    this._test('get', path, done, {
        code: 200,
        headers: {
            'content-type': /text\/css/
        }
    });
};

/**
 * Performs an http test on a get request to a js resource.
 *
 * @class HttpHelper
 * @method testJs
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 */
HttpHelper.prototype.testJs = function(path, done) {
    this._test('get', path, done, {
        code: 200,
        headers: {
            'content-type': /application\/javascript/
        }
    });
};

/**
 * Performs an http test on a get request to a JSON resource.
 *
 * @class HttpHelper
 * @method testJson
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 * @param {Object} [expectedResponse] An optional object that defines the
 *          expected JSON response. If a function is specified for this
 *          parameter, the function will be invoked with the err/response
 *          parameters, allowing execution of custom tests. Response test will
 *          not be performed if this parameter is omitted.
 */
HttpHelper.prototype.testJson = function(path, done, expectedResponse) {
    var finish = function(err, res) {
        expect(err).to.be.null;

        if(typeof expectedResponse === 'function') {
            expectedResponse(err, res);
            return;
        }

        if(!expectedResponse || typeof expectedResponse !== 'object') {
            //No tests to perform.
            return;
        }

        var payload = res.body;
        expect(payload).to.be.defined;
        expect(payload).to.deep.equal(expectedResponse);
    };
    this._test('get', path, done, {
        code: 200,
        headers: {
            'content-type': /application\/json/
        },
        finish: finish
    });
};

module.exports = HttpHelper;
