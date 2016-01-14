/* jshint node:true, expr:true */
'use strict';

var _util = require('util');
var _sinon = require('sinon');
var _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));

var _assertionHelper = require('wysknd-test').assertionHelper;

var expect = require('chai').expect;
var DataAccess = require('../../../server/data/data-access');
var UserProfile = require('../../../server/data/user-profile');

describe('server.data.UserProfile', function() {

    var USER_LIST= [ {
        username: 'pparker',
        firstName: 'Peter',
        lastName: 'Parker',
        title: 'Spiderman',
        roles: [ 'superhero', 'reporter' ]
    }, {
        username: 'todinson',
        firstName: 'Thor',
        lastName: 'Odinson',
        title: 'Thor',
        roles: [ 'superhero', 'demigod' ]
    }, {
        username: 'tstark',
        firstName: 'Tony',
        lastName: 'Stark',
        title: 'Iron Man',
        roles: [ 'superhero', 'engineer' ]
    }, {
        username: 'nosborne',
        firstName: 'Norman',
        lastName: 'Osborne',
        title: 'Green Goblin',
        roles: [ 'villain', 'businessman' ]
    }, {
        username: 'llaufeyson',
        firstName: 'Loki',
        lastName: 'Laufeyson',
        title: 'Loki',
        roles: [ 'villain', 'demigod' ]
    }, {
        username: 'vvdoom',
        firstName: 'Victor',
        lastName: 'Von Doom',
        title: 'Dr. Doom',
        roles: [ 'villain', 'engineer' ]
    } ];
    var VALID_USERDATA = USER_LIST[0];
    var VALID_USERNAME = VALID_USERDATA.username;

    function _createInstance() {
        return new UserProfile();
    }

    //TODO: The current user profile object has a dummy implementation, and must be
    //replaced with a more meaningful real world implementation. At that time, these
    //test cases will have to be revised appropriately.
    describe('ctor()', function() {
        it('should return an object with expected properties and methods', function() {
            var userProfile = _createInstance();

            expect(userProfile).to.be.an('object');
            expect(userProfile).to.be.an.instanceof(DataAccess);

            expect(userProfile).to.have.property('lookupUser').and.to.be.a('function');
            expect(userProfile).to.have.property('saveUser').and.to.be.a('function');
            expect(userProfile).to.have.property('findUsers').and.to.be.a('function');
        });
    });

    describe('lookupUser()', function() {
        it('should throw an error when invoked with an invalid user name', function() {
            var error = 'Invalid username specified (arg #1)';

            function invoke(username) {
                return function() {
                    var userProfile = _createInstance();
                    userProfile.lookupUser(username);
                };
            }
            expect(invoke(null)).to.throw(error);
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should return a promise when invoked with a valid username', function() {
            var userProfile = _createInstance();
            var ret = userProfile.lookupUser(VALID_USERNAME);

            expect(ret).to.be.an('object');
            expect(ret).to.have.property('then').and.to.be.a('function');
        });

        it('should resolve the promise if the user profile was retrieved successfully', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.lookupUser(VALID_USERNAME)

            expect(ret).to.be.fulfilled
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should return the user profile data if a user profile is found for the specified username', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.lookupUser(VALID_USERNAME)

            function verifyProfile(profile){
                expect(profile).to.deep.equal(VALID_USERDATA);
            }

            expect(ret).to.be.fulfilled
                .then(verifyProfile)
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should return null if a user profile is not found for the specified username', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.lookupUser('baduser')

            function verifyProfile(profile){
                expect(profile).to.be.null;
            }

            expect(ret).to.be.fulfilled
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });
    });

    describe('saveUser()', function() {
        it('should throw an error when invoked with an invalid user name', function() {
            var error = 'Invalid username specified (arg #1)';

            function invoke(username) {
                return function() {
                    var userProfile = _createInstance();
                    userProfile.saveUser(username);
                };
            }
            expect(invoke(null)).to.throw(error);
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke({})).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should throw an error when invoked with an invalid profile object', function() {
            var error = 'Invalid profile data specified (arg #2)';

            function invoke(profileData) {
                return function() {
                    var userProfile = _createInstance();
                    userProfile.saveUser(VALID_USERNAME, profileData);
                };
            }
            expect(invoke(null)).to.throw(error);
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should return a promise when invoked with a valid username and profile data', function() {
            var userProfile = _createInstance();
            var ret = userProfile.saveUser(VALID_USERNAME, VALID_USERDATA);

            expect(ret).to.be.an('object');
            expect(ret).to.have.property('then').and.to.be.a('function');
        });

        it('should resolve the promise if the user profile was saved successfully', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.saveUser(VALID_USERNAME, VALID_USERDATA)

            expect(ret).to.be.fulfilled
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should update the user profile data for the specified username', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.saveUser(VALID_USERNAME, VALID_USERDATA)

            function verifySave(profile){
                expect(userProfile._DUMMY_USER_LIST[VALID_USERNAME]).to.deep.equal(VALID_USERDATA);
                expect(userProfile._DUMMY_USER_LIST[VALID_USERNAME]).to.not.equal(VALID_USERDATA);
            }

            expect(ret).to.be.fulfilled
                .then(verifySave)
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });
    });

    describe('findUsers()', function() {
        it('should throw an error when invoked with invalid search criteria', function() {
            var error = 'Invalid search criteria specified (arg #1)';

            function invoke(searchCriteria) {
                return function() {
                    var userProfile = _createInstance();
                    userProfile.findUsers(searchCriteria);
                };
            }
            expect(invoke(null)).to.throw(error);
            expect(invoke(undefined)).to.throw(error);
            expect(invoke(123)).to.throw(error);
            expect(invoke('')).to.throw(error);
            expect(invoke(true)).to.throw(error);
            expect(invoke([])).to.throw(error);
            expect(invoke(function() {})).to.throw(error);
        });

        it('should return a promise when invoked', function() {
            var userProfile = _createInstance();
            var ret = userProfile.findUsers({});

            expect(ret).to.be.an('object');
            expect(ret).to.have.property('then').and.to.be.a('function');
        });

        it('should resolve the promise once the find operation is completed', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.findUsers({});

            expect(ret).to.be.fulfilled
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should return an empty array if the search criteria is empty', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.findUsers({});

            function verifyFetch(results) {
                expect(results).to.be.an('array');
                expect(results).to.be.empty;
            }

            expect(ret).to.be.fulfilled
                .then(verifyFetch)
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should ignore search criteria that have no matching properties on the user profile', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.findUsers({
                badProp: 'dontcare',
                foo: 'bar',
                marco: 'polo'
            });

            function verifyFetch(results) {
                expect(results).to.be.an('array');
                expect(results).to.be.empty;
            }

            expect(ret).to.be.fulfilled
                .then(verifyFetch)
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should ignore search criteria that have matching properties that are not strings on the user profile', function(done) {
            var userProfile = _createInstance();
            var ret = userProfile.findUsers({
                roles: 'dontcare'
            });

            function verifyFetch(results) {
                expect(results).to.be.an('array');
                expect(results).to.be.empty;
            }

            expect(ret).to.be.fulfilled
                .then(verifyFetch)
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should return a list of user profiles filtered by partial string matches on the search criteria', function(done) {
            var userProfile = _createInstance();
            var searchCriteria = {
                username: 'p'
            };
            var expectedList = USER_LIST.filter(function(item) {
                return item.username === 'pparker';
            });
            var ret = userProfile.findUsers(searchCriteria);

            function verifyFetch(results) {
                expect(results).to.deep.equal(expectedList);
            }

            expect(ret).to.be.fulfilled
                .then(verifyFetch)
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should apply search criteria cumulatively (boolean and)', function(done) {
            var userProfile = _createInstance();
            var searchCriteria = {
                username: 'p',
                firstName: 'Tony'
            };
            var ret = userProfile.findUsers(searchCriteria);

            function verifyFetch(results) {
                expect(results).to.be.an('array');
                expect(results).to.be.empty;
            }

            expect(ret).to.be.fulfilled
                .then(verifyFetch)
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });

        it('should not consider properties that are not defined on the user profile object', function(done) {
            var userProfile = _createInstance();
            var searchCriteria = {
                username: 'p',
                marco: 'polo'
            };
            var expectedList = USER_LIST.filter(function(item) {
                return item.username === 'pparker';
            });
            var ret = userProfile.findUsers(searchCriteria);

            function verifyFetch(results) {
                expect(results).to.deep.equal(expectedList);
            }

            expect(ret).to.be.fulfilled
                .then(verifyFetch)
                .then(_assertionHelper.getNotifySuccessHandler(done),
                      _assertionHelper.getNotifyFailureHandler(done));
        });
    });

});
