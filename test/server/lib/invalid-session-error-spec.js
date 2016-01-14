/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var InvalidSessionError = require('../../../server/lib/invalid-session-error');

describe('InvalidSessionError', function() {
    describe('ctor()', function() {
        it('should inherit from the Error object', function() {
            var error = new InvalidSessionError('error message');

            expect(error).to.be.an('object');
            expect(error).to.be.an.instanceof(Error);
        });
    });


});
