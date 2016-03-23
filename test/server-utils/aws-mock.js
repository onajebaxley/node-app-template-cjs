/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var MockReq = require('mock-req');
var MockRes = require('mock-res');

function _getRequestObject() {
    var awsReq = {
        __readStream: {
            on: _sinon.spy(),
            pipe: _sinon.spy()
        }
    };

    awsReq.createReadStream = _sinon.stub().returns(awsReq.__readStream);
    return awsReq;
}

function _createS3Mock() {
    var mock = {
        __request: _getRequestObject()
    };

    mock.getObject = _sinon.stub().returns(mock.__request);
    return mock;
}

/**
 * Module that exposes a mock object for the AWS SDK client.
 *
 * @module test.serverUtils.awsMock
 */
module.exports = {
    /**
     * Gets a mock of the aws object
     *
     * @module test.serverUtils.awsMock
     * @return {Object} A mock AWS object
     */
    init: function() {
        //TODO: This needs refactoring
        var s3Mock = _createS3Mock();
        var aws = {
            S3: _sinon.stub().returns(s3Mock)
        };

        return aws;
    }
};
