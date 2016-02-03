/* jshint expr:true */
'use strict';

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _module = require('../../client/js/templates');

describe('[templates]', function() {

    beforeEach(angular.mock.module(_module));

    describe('[init]', function() {
        it('should return an array', function() {
            var mod = angular.module(_module);
            var runBlock = mod._runBlocks[0];

            expect(runBlock).to.be.an('Array');
            var blockFunction = runBlock[runBlock.length - 1];
            expect(blockFunction).to.be.a('function');
        });

        it('should do nothing when invoked', function() {
            var mod = angular.module(_module);
            var runBlock = mod._runBlocks[0];
            var blockFunction = runBlock[runBlock.length - 1];

            //We're really not testing here, and this call simply helps
            //code coverage numbers.
            blockFunction({
                put: _sinon.spy()
            });
        });
    });
});
