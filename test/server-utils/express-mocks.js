/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var MockReq = require('mock-req');
var MockRes = require('mock-res');

/**
 * Module that exposes mock request/response objects for testing expressjs
 * handlers.
 *
 * @module test.utils.expressMocks
 */
module.exports = {

    /**
     * Gets a mock of the express library.
     *
     * @module test.utils.expressMocks
     * @return {Object} A mock express object
     */
    getMockExpress: function() {
        var express = _sinon.spy();

        express._router = function() {};
        ['get', 'put', 'post', 'delete'].forEach(function(verb) {
            express._router[verb] = _sinon.spy();
        });

        express._router.use = _sinon.spy();
        express.static = _sinon.stub().returns(function() {});
        express.Router = _sinon.stub().returns(express._router);
        return express;
    },

    /**
     * Gets a mock request object with additional methods that mock those
     * provided by expressjs.
     *
     * @module test.utils.expressMocks
     * @return {Object} A mock response object.
     */
    getMockReq: function() {
        var req = new MockReq();
        req.query = {};
        req.body = {};
        return req;
    },

    /**
     * Gets a mock response object with additional methods that mock those
     * provided by expressjs.
     *
     * @module test.utils.expressMocks
     * @return {Object} A mock response object.
     */
    getMockRes: function() {
        var res = new MockRes();

        res.locals = {};

        ['set', 'status', 'send', 'render', 'redirect'].forEach(function(method) {
            res[method] = res[method] || function() {};
        });

        _sinon.stub(res, 'set', function(headers) {
            if (typeof headers === 'object') {
                for (var headerName in headers) {
                    res.setHeader(headerName.toLowerCase(), headers[headerName]);
                }
            }
            return res;
        });

        _sinon.stub(res, 'status', function(code) {
            res.statusCode = code;
            return res;
        });

        _sinon.stub(res, 'send', function(data) {
            if (res._headers['content-type'] === 'application/json') {
                data = JSON.stringify(data);
            }
            res.end(data);
            return res;
        });

        _sinon.stub(res, 'render', function(view, args) {
            return res;
        });

        _sinon.stub(res, 'redirect', function(view, args) {
            return res;
        });

        return res;
    }
};
