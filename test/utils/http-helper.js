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
HttpHelper.prototype._ensureOptions = function(options) {
    options = _clone(options);

    if(!options || typeof options !== 'object') {
        options = {};
    }

    if(typeof options.code !== 'number' || options.code < 0) {
        options.code = 200;
    }

    if(!options.headers || typeof options.headers !== 'object') {
        options.headers = {};
    }

    if(!options.body || typeof options.body !== 'object') {
        options.body = {};
    }

    return options;
};

/**
 * @class HttpHelper
 * @method _test
 * @private
 */
HttpHelper.prototype._test = function(verb, path, done, request, response, finish) {
    if(typeof verb !== 'string' || verb.length <= 0) {
        throw new Error('Invalid verb specified (arg #1)');
    }
    if(typeof path !== 'string' || path.length <= 0) {
        throw new Error('Invalid path specified (arg #2)');
    }
    if(typeof done !== 'function') {
        throw new Error('Invalid callback specified (arg #3)');
    }

    request = this._ensureOptions(request);
    response = this._ensureOptions(response);
    if(typeof finish !== 'function') {
        finish = function(err, res) {
            expect(err).to.be.null;
        };
    }

    var requestPath = _path.join(this._basePath, path);
    var name = null;

    // ----------- REQUEST ----------------
    var handler = _supertest(this._baseUrl);
    handler = handler[verb](requestPath);

    for(name in request.headers) {
        handler = handler.set(name, request.headers[name]);
    }

    // ----------- RESPONSE ----------------
    handler.expect(response.code);
    if(verb === 'post' || verb === 'put') {
        handler = handler.send(request.body);
    }

    for(name in response.headers) {
        handler = handler.expect(name, response.headers[name]);
    }


    // ----------- END ----------------
    handler.end(function(err, res) {
        finish(err, res);
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
 * @param {Object} [reqOpts] An optional options object that can contain
 *          additional request parameters - headers, body, etc.
 * @param {Object} [resOpts] An optional options object that can contain
 *          additional response parameters - headers, code, etc.
 */
HttpHelper.prototype.testGet = function(path, done, reqOpts, resOpts) {
    this._test('get', path, done, reqOpts, resOpts);
};

/**
 * Performs an http test on a post request to the specified url.
 *
 * @class HttpHelper
 * @method testPost
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 * @param {Object} [reqOpts] An optional options object that can contain
 *          additional request parameters - headers, body, etc.
 * @param {Object} [resOpts] An optional options object that can contain
 *          additional response parameters - headers, code, etc.
 */
HttpHelper.prototype.testPost = function(path, done, reqOpts, resOpts) {
    this._test('post', path, done, reqOpts, resOpts);
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
    this._test('get', path, done, {}, {
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
    this._test('get', path, done, {}, {
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
    this._test('get', path, done, {}, {
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
    this._test('get', path, done, {}, {
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
    this._test('get', path, done, {}, {
        code: 200,
        headers: {
            'content-type': /application\/javascript/
        }
    });
};

/**
 * Performs an http test on a get request to an image resource.
 *
 * @class HttpHelper
 * @method testImage
 * @param {String} path The path to the resource to query
 * @param {Function} done A callback that will be invoked when the asynchronous
 *          test is complete
 */
HttpHelper.prototype.testImage = function(path, done) {
    this._test('get', path, done, {}, {
        code: 200,
        headers: {
            'content-type': /image\/x-icon/
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
    this._test('get', path, done, {}, {
        code: 200,
        headers: {
            'content-type': /application\/json/
        }
    }, finish);
};

module.exports = HttpHelper;
