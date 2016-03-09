/* jshint expr:true */
/* global alert:true */

var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

var _angular = require('angular');
var _ngMocks = require('angular-mocks');

var _module = 'app.layout';
var _mockHelper = require('../../../client-utils/mock-helper');

describe('[app.layout.MessageBlock]', function() {
    'use strict';

    var Service = null;

    beforeEach(angular.mock.module(_module));

    beforeEach(inject(['app.layout.MessageBlock', function(injectedService) {
        Service = injectedService;
    }]));

    describe('[init]', function() {
        it('should define the necessary fields and methods', function() {
            expect(Service).to.be.a('function');
        });
    });

    describe('ctor()', function() {
        it('should return an object with required properties when invoked with valid options', function() {
            var block = new Service();

            expect(block).to.be.an('object');
            expect(block).to.have.property('message', '');
            expect(block).to.have.property('severity', '');

            expect(block).to.have.property('info').and.to.be.a('function');
            expect(block).to.have.property('warning').and.to.be.an('function');
            expect(block).to.have.property('error').and.to.be.a('function');

            expect(block).to.have.property('hasMessage').and.to.be.a('function');
            expect(block).to.have.property('clear').and.to.be.a('function');
        });
    });

    describe('info()', function() {
        it('should set the message severity to "info" when invoked', function() {
            var block = new Service();

            block.severity = '';
            block.info();

            expect(block.severity).to.equal('info');
        });

        it('should default the message to an empty text if omitted', function() {
            var block = new Service();

            block.message = undefined;
            block.info();

            expect(block.message).to.be.a('string').and.to.be.empty;
        });

        it('should assign the message member to the specified string if one was specified', function() {
            var block = new Service();
            var message = 'abc';

            block.message = undefined;
            block.info(message);

            expect(block.message).to.equal(message);
        });
    });

    describe('warning()', function() {
        it('should set the message severity to "warning" when invoked', function() {
            var block = new Service();

            block.severity = '';
            block.warning();

            expect(block.severity).to.equal('warning');
        });

        it('should default the message to an empty text if omitted', function() {
            var block = new Service();

            block.message = undefined;
            block.warning();

            expect(block.message).to.be.a('string').and.to.be.empty;
        });

        it('should assign the message member to the specified string if one was specified', function() {
            var block = new Service();
            var message = 'abc';

            block.message = undefined;
            block.warning(message);

            expect(block.message).to.equal(message);
        });
    });

    describe('error()', function() {
        it('should set the message severity to "error" when invoked', function() {
            var block = new Service();

            block.severity = '';
            block.error();

            expect(block.severity).to.equal('error');
        });

        it('should default the message to an empty text if omitted', function() {
            var block = new Service();

            block.message = undefined;
            block.error();

            expect(block.message).to.be.a('string').and.to.be.empty;
        });

        it('should assign the message member to the specified string if one was specified', function() {
            var block = new Service();
            var message = 'abc';

            block.message = undefined;
            block.error(message);

            expect(block.message).to.equal(message);
        });
    });

    describe('hasMessage()', function() {
        it('should return true if the message is a valid and non empty string', function() {
            var block = new Service();
            block.message = 'foo';

            expect(block.hasMessage()).to.be.true;
        });

        it('should return false if the message is not a string, or is empty', function() {
            function doTest(message) {
                var block = new Service();
                block.message = message;

                expect(block.hasMessage()).to.be.false;
            }

            doTest(undefined);
            doTest(null);
            doTest(123);
            doTest('');
            doTest(true);
            doTest({});
            doTest([]);
            doTest(function() {});
        });
    });

    describe('clear()', function() {
        it('should clear the error message and severity when invoked', function() {
            var block = new Service();
            block.message = 'foo';
            block.severity = 'error';

            block.clear();

            expect(block.message).to.equal('');
            expect(block.severity).to.equal('');
        });
    });

});
