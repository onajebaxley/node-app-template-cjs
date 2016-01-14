/* jshint node:true, expr:true */
'use strict';

var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var expect = require('chai').expect;
var DataAccess = require('../../../server/data/data-access');

describe('server.data.DataAccess', function() {

    describe('ctor()', function() {
        it('should default the connection parameters to an empty object if valid parameters are not specified', function() {

            function checkDefaultConnectionParams(options) {
                var dao = new DataAccess(options);
                expect(dao._connectionParams).to.be.an('object');
                expect(dao._connectionParams).to.be.empty;
            }
            
            checkDefaultConnectionParams(null);
            checkDefaultConnectionParams(undefined);
            checkDefaultConnectionParams(123);
            checkDefaultConnectionParams('abc');
            checkDefaultConnectionParams(true);
            checkDefaultConnectionParams([]);
            checkDefaultConnectionParams(function() {});
        });

        it('should create a clone of the connection parameters object when a valid object is specified', function() {
            var options = {
                database: 'foo',
                user: 'joe',
                password: 'shmoe'
            };
            var dao = new DataAccess(options);
            expect(dao._connectionParams).to.deep.equal(options);
            expect(dao._connectionParams).to.not.equal(options);
        });

        it('should expose the expected methods and properties', function() {
            var dao = new DataAccess({});

            //expect(dao).to.have.property('_wrapWithExceptionHandler').and.to.be.a('function');
        });
    });

});
