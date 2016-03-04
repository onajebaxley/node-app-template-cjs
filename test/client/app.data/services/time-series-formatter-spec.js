/* jshint expr:true */
/* global alert:true */

var _angular = require('angular');
var _ngMocks = require('angular-mocks');
var _chai = require('chai');
var _sinon = require('sinon');
var _sinonChai = require('sinon-chai');
var _chaiAsPromised = require('chai-as-promised');
var _module = 'app.data';

_chai.use(_sinonChai);
_chai.use(_chaiAsPromised);
var expect = _chai.expect;

describe('[app.data.TimeSeriesFormatter]', function() {
    'use strict';

    var BASE_TIMESTAMP = 1436796000000;
    var Service = null;

    function _createFormatter(options) {
        options = options || {};
        options.groupingFunction = options.groupingFunction || function() {
            return 0;
        };
        options.resolution = options.resolution || Service.DEFAULT_RESOLUTION;

        return new Service(options);
    }

    beforeEach(angular.mock.module(_module));
    beforeEach(angular.mock.module(['$provide', function($provide) {
    }]));
    beforeEach(inject(['app.data.TimeSeriesFormatter', function(injectedService) {
        Service = injectedService;
    }]));

    describe('ctor()', function() {
        it('should throw an error if invoked without valid options', function() {
            var error = 'Invalid options specified (arg #1)';

            function createObject(options) {
                return function() {
                    return new Service(options);
                };
            }

            expect(createObject()).to.throw(error);
            expect(createObject(null)).to.throw(error);
            expect(createObject(123)).to.throw(error);
            expect(createObject('abc')).to.throw(error);
            expect(createObject(true)).to.throw(error);
            expect(createObject(function() {})).to.throw(error);
        });

        it('should throw an error if the options does not specify a grouping function', function() {
            var error = 'Invalid grouping function specified (options.groupingFunction)';

            function createObject(groupingFunction) {
                return function() {
                    var options = {
                        groupingFunction: groupingFunction
                    };
                    return new Service(options);
                };
            }

            expect(createObject()).to.throw(error);
            expect(createObject(null)).to.throw(error);
            expect(createObject(123)).to.throw(error);
            expect(createObject('abc')).to.throw(error);
            expect(createObject(true)).to.throw(error);
            expect(createObject({})).to.throw(error);
        });

        it('should throw an error if an invalid resolution is specified', function() {
            var error = 'Invalid resolution specified. Must be a positive number (options.resolution)';

            function createObject(resolution) {
                return function() {
                    var options = {
                        groupingFunction: function() {
                            return 0;
                        },
                        resolution: resolution
                    };
                    return new Service(options);
                };
            }

            expect(createObject(-123)).to.throw(error);
            expect(createObject('abc')).to.throw(error);
            expect(createObject(true)).to.throw(error);
            expect(createObject({})).to.throw(error);
            expect(createObject([])).to.throw(error);
            expect(createObject(function() {})).to.throw(error);
        });

        it('should not throw an error if a resolution is omitted, or is a valid positive number', function() {
            function createObject(resolution) {
                return function() {
                    var options = {
                        groupingFunction: function() {
                            return 0;
                        },
                        resolution: resolution
                    };
                    return new Service(options);
                };
            }

            expect(createObject()).to.not.throw();
            expect(createObject(null)).to.not.throw();
            expect(createObject(100)).to.not.throw();
        });

        it('should expose members required by the interface', function() {
            var formatter = new Service({
                groupingFunction: function() {
                    return 0;
                }
            });

            expect(Service).to.have.property('DEFAULT_RESOLUTION').and.to.be.a('number');
            expect(formatter).to.have.property('setDataSet').and.to.be.a('function');
            expect(formatter).to.have.property('removeDataSet').and.to.be.a('function');
            expect(formatter).to.have.property('setGroupingFunction').and.to.be.a('function');
            expect(formatter).to.have.property('setResolution').and.to.be.a('function');
            expect(formatter).to.have.property('generateChartData').and.to.be.a('function');
        });
    });

    describe('setDataSet()', function() {
        it('should throw an error if an invalid id is specified', function() {
            var error = 'Invalid data set id specified (arg #1)';

            function invokeMethod(id) {
                return function() {
                    var formatter = _createFormatter();
                    return formatter.setDataSet(id);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if an invalid data array is specified', function() {
            var error = 'Invalid data specified (arg #2)';

            function invokeMethod(dataSet) {
                return function() {
                    var id = 'test_set';
                    var formatter = _createFormatter();
                    return formatter.setDataSet(id);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should store raw data, and generate chart data based on the raw data when invoked', function() {
            var dataSetIds = ['test_set_1', 'test_set_2'];

            var formatter = _createFormatter();

            //NOTE: Querying private variable. No other way to test.
            expect(formatter._dataSets).to.be.empty;
            formatter.setDataSet(dataSetIds[0], []);
            formatter.setDataSet(dataSetIds[1], []);

            expect(formatter._dataSets).to.have.property(dataSetIds[0]).and.to.be.an('object');
            expect(formatter._dataSets[dataSetIds[0]]).to.have.property('rawData').and.to.be.an('Array');
            expect(formatter._dataSets[dataSetIds[0]]).to.have.property('chartData').and.to.be.an('object');

            expect(formatter._dataSets).to.have.property(dataSetIds[1]).and.to.be.an('object');
            expect(formatter._dataSets[dataSetIds[1]]).to.have.property('rawData').and.to.be.an('Array');
            expect(formatter._dataSets[dataSetIds[1]]).to.have.property('chartData').and.to.be.an('object');
        });

        it('should update the raw data, and regenerate chart data if data is specified twice for the same data set', function() {
            var dataSetId = 'test_set_1';

            var formatter = _createFormatter();

            //NOTE: Querying private variable. No other way to test.
            expect(formatter._dataSets).to.be.empty;

            formatter.setDataSet(dataSetId, []);
            expect(formatter._dataSets).to.have.all.keys([dataSetId]);

            var oldRawData = formatter._dataSets[dataSetId].rawData;
            var oldChartData = formatter._dataSets[dataSetId].chartData;

            formatter.setDataSet(dataSetId, []);
            expect(formatter._dataSets).to.have.all.keys([dataSetId]); // No new keys have been added.
            expect(formatter._dataSets[dataSetId]).to.have.property('rawData').and.to.not.equal(oldRawData);
            expect(formatter._dataSets[dataSetId]).to.have.property('chartData').and.to.not.equal(oldChartData);
        });

        it('should group the data set by the specified interval and store the groups is the generated chart data', function() {
            var dataSetId = 'test_set';
            var resolution = 15;

            var formatter = _createFormatter({
                resolution: resolution
            });

            var baseTimestamp = 1436796000000;
            var data = [
                // These two rows should be grouped into an interval at
                // base + (resolution * 1000)
                {
                    timestamp: baseTimestamp + (1 * 1000),
                    value: 90
                }, {
                    timestamp: baseTimestamp + (5 * 1000),
                    value: 100
                },

                // These two rows should be grouped into an interval at
                // base + (resolution * 2 * 1000)
                {
                    timestamp: baseTimestamp + (16 * 1000),
                    value: 100
                }, {
                    timestamp: baseTimestamp + (21 * 1000),
                    value: 110
                },
            ];

            var intervals = [
                (baseTimestamp + (resolution * 1000)).toString(), (baseTimestamp + (resolution * 2 * 1000)).toString()
            ];

            //NOTE: Querying private variable. No other way to test.
            formatter.setDataSet(dataSetId, data);

            expect(formatter._dataSets[dataSetId].chartData).to.have.all.keys(intervals);
        });

        it('should use the grouping function once per group to compute the final value for the group', function() {
            var dataSetId = 'test_set';
            var groupingFunctionResponse = 'group_response';
            var groupingFunctionSpy = _sinon.stub().returns(groupingFunctionResponse);
            var resolution = 15;

            var formatter = _createFormatter({
                groupingFunction: groupingFunctionSpy,
                resolution: resolution
            });

            var baseTimestamp = 1436796000000;
            var expectedValues = [
                [90, 100],
                [110, 120]
            ];
            var data = [
                // These two rows should be grouped into an interval at
                // base + (resolution * 1000)
                {
                    timestamp: baseTimestamp + (1 * 1000),
                    value: expectedValues[0][0]
                }, {
                    timestamp: baseTimestamp + (5 * 1000),
                    value: expectedValues[0][1]
                },

                // These two rows should be grouped into an interval at
                // base + (resolution * 2 * 1000)
                {
                    timestamp: baseTimestamp + (16 * 1000),
                    value: expectedValues[1][0]
                }, {
                    timestamp: baseTimestamp + (21 * 1000),
                    value: expectedValues[1][1]
                },
            ];

            //NOTE: Querying private variable. No other way to test.
            expect(groupingFunctionSpy).to.not.have.been.called;
            formatter.setDataSet(dataSetId, data);

            // We're expecting two groups
            expect(groupingFunctionSpy).to.have.been.calledTwice;
            expect(groupingFunctionSpy.args[0][0]).to.deep.equal(expectedValues[0]);
            expect(groupingFunctionSpy.args[1][0]).to.deep.equal(expectedValues[1]);

            //Make sure that the group has the value returned by the grouping function.
            for (var key in formatter._dataSets[dataSetId].chartData) {
                var group = formatter._dataSets[dataSetId].chartData[key];

                expect(group.value).to.equal(groupingFunctionResponse);
            }

        });
    });

    describe('removeDataSet()', function() {
        it('should throw an error if an invalid id is specified', function() {
            var error = 'Invalid data set id specified (arg #1)';

            function invokeMethod(id) {
                return function() {
                    var formatter = _createFormatter();
                    return formatter.removeDataSet(id);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should do nothing if the specified data set was not previously been added', function() {
            var dataSetId = 'test_set';

            var formatter = _createFormatter();

            //NOTE: Querying private variable. No other way to test.
            expect(formatter._dataSets).to.be.empty;
            formatter.removeDataSet(dataSetId);
            expect(formatter._dataSets).to.be.empty;
        });

        it('should remove the specified data set if it was previously been added', function() {
            var dataSetIds = ['test_set_1', 'test_set_2'];

            var formatter = _createFormatter();

            formatter.setDataSet(dataSetIds[0], []);
            formatter.setDataSet(dataSetIds[1], []);

            //NOTE: Querying private variable. No other way to test.
            expect(formatter._dataSets).to.have.property(dataSetIds[0]);
            expect(formatter._dataSets).to.have.property(dataSetIds[1]);

            formatter.removeDataSet(dataSetIds[0]);
            expect(formatter._dataSets).to.not.have.property(dataSetIds[0]);
            expect(formatter._dataSets).to.have.property(dataSetIds[1]);
        });
    });

    describe('setGroupingFunction()', function() {
        it('should throw an error if an invalid grouping function is specified', function() {
            var error = 'Invalid grouping function specified (arg #1)';

            function invokeMethod(groupingFunction) {
                return function() {
                    var formatter = _createFormatter();
                    return formatter.setGroupingFunction(groupingFunction);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
        });

        it('should re run data set preparation for all data sets when invoked', function() {
            var dataSetIds = ['test_set_1', 'test_set_2']
            var groupingFunctionSpy = _sinon.spy();
            var resolution = 15;

            var formatter = _createFormatter({
                groupingFunction: function() {
                    return 0;
                },
                resolution: resolution
            });

            var baseTimestamp = 1436796000000;
            var expectedValues = [
                [90, 100],
                [110, 120]
            ];
            var data = [
                // These two rows should be grouped into an interval at
                // base + (resolution * 1000)
                {
                    timestamp: baseTimestamp + (1 * 1000),
                    value: expectedValues[0][0]
                }, {
                    timestamp: baseTimestamp + (5 * 1000),
                    value: expectedValues[0][1]
                },

                // These two rows should be grouped into an interval at
                // base + (resolution * 2 * 1000)
                {
                    timestamp: baseTimestamp + (16 * 1000),
                    value: expectedValues[1][0]
                }, {
                    timestamp: baseTimestamp + (21 * 1000),
                    value: expectedValues[1][1]
                },
            ];

            //NOTE: Querying private variable. No other way to test.
            formatter.setDataSet(dataSetIds[0], data);
            formatter.setDataSet(dataSetIds[1], data);

            formatter.setGroupingFunction(groupingFunctionSpy);
            // We're expecting two groups for each data set.
            expect(groupingFunctionSpy).to.have.been.called;
            expect(groupingFunctionSpy.callCount).to.equal(4);

            expect(groupingFunctionSpy.args[0][0]).to.deep.equal(expectedValues[0]);
            expect(groupingFunctionSpy.args[1][0]).to.deep.equal(expectedValues[1]);

            expect(groupingFunctionSpy.args[2][0]).to.deep.equal(expectedValues[0]);
            expect(groupingFunctionSpy.args[3][0]).to.deep.equal(expectedValues[1]);
        });
    });

    describe('setResolution()', function() {
        it('should throw an error if an invalid resolution is specified', function() {
            var error = 'Invalid resolution specified. Must be a positive number (arg #1)';

            function invokeMethod(resolution) {
                return function() {
                    var formatter = _createFormatter();
                    return formatter.setResolution(resolution);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('')).to.throw(error);
            expect(invokeMethod(-1)).to.throw(error);
            expect(invokeMethod(0)).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should re run data set preparation for all data sets when invoked', function() {
            var dataSetIds = ['test_set_1', 'test_set_2']
            var resolution = 15;

            var formatter = _createFormatter({
                resolution: resolution
            });

            var baseTimestamp = 1436796000000;
            var data = [{
                timestamp: baseTimestamp + (9 * 1000),
                value: 90
            }, {
                timestamp: baseTimestamp + (11 * 1000),
                value: 100
            }, {
                timestamp: baseTimestamp + (19 * 1000),
                value: 100
            }, {
                timestamp: baseTimestamp + (21 * 1000),
                value: 110
            }];

            var initialIntervals = [
                (baseTimestamp + (resolution * 1000)).toString(), (baseTimestamp + (resolution * 2 * 1000)).toString()
            ];

            //NOTE: Querying private variable. No other way to test.
            formatter.setDataSet(dataSetIds[0], data);
            formatter.setDataSet(dataSetIds[1], data);

            expect(formatter._dataSets[dataSetIds[0]].chartData).to.have.all.keys(initialIntervals);
            expect(formatter._dataSets[dataSetIds[1]].chartData).to.have.all.keys(initialIntervals);

            resolution = 10;
            var finalIntervals = [
                (baseTimestamp + (resolution * 1000)).toString(), (baseTimestamp + (resolution * 2 * 1000)).toString(), (baseTimestamp + (resolution * 3 * 1000)).toString()
            ];
            formatter.setResolution(resolution);

            expect(formatter._dataSets[dataSetIds[0]].chartData).to.have.all.keys(finalIntervals);
            expect(formatter._dataSets[dataSetIds[1]].chartData).to.have.all.keys(finalIntervals);
        });
    });

    describe('generateChartData()', function() {
        function _generateOptions(options) {
            options = options || {};
            options.startTime = options.startTime || Date.now() - (5 * 60 * 1000);
            options.endTime = options.endTime || Date.now();
            return options;
        }


        it('should throw an error if invoked without a valid options object', function() {
            var error = 'Invalid options specified (arg #1)';

            function invokeMethod(options) {
                return function() {
                    var formatter = _createFormatter();
                    return formatter.generateChartData(options);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod(123)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod(true)).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the options does not define a valid start time', function() {
            var error = 'Options does not define a valid start time (options.startTime)';

            function invokeMethod(startTime) {
                return function() {
                    var formatter = _createFormatter();
                    var options = {
                        startTime: startTime
                    };
                    return formatter.generateChartData(options);
                };
            }

            expect(invokeMethod()).to.throw(error);
            expect(invokeMethod(null)).to.throw(error);
            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the options defines an invalid end time', function() {
            var error = 'Options does not define a valid end time (options.endTime)';

            function invokeMethod(endTime) {
                return function() {
                    var formatter = _createFormatter();
                    var options = {
                        startTime: Date.now(),
                        endTime: endTime
                    };
                    return formatter.generateChartData(options);
                };
            }

            expect(invokeMethod('abc')).to.throw(error);
            expect(invokeMethod({})).to.throw(error);
            expect(invokeMethod([])).to.throw(error);
            expect(invokeMethod(function() {})).to.throw(error);
        });

        it('should throw an error if the end time is earlier than the start time', function() {
            var error = 'End time cannot be earlier than start time';

            function invokeMethod(startTime, endTime) {
                return function() {
                    var formatter = _createFormatter();
                    var options = {
                        startTime: startTime,
                        endTime: endTime
                    };
                    return formatter.generateChartData(options);
                };
            }

            expect(invokeMethod(Date.now(), Date.now() - 1000)).to.throw(error);
        });

        it('should return an object when invoked, with the required members', function() {
            var formatter = _createFormatter();
            var options = _generateOptions();
            var data = formatter.generateChartData(options);

            expect(data).to.be.an('object');
            expect(data).to.have.property('labels').and.to.be.an('Array');
            expect(data).to.have.property('series').and.to.be.an('Array');
            expect(data).to.have.property('data').and.to.be.an('Array');
        });

        describe('[Label Generation]', function() {

            it('should populate labels with timestamps ranging from start time to end time', function() {
                var resolution = 15;
                var sampleCount = 10;
                var formatter = _createFormatter({
                    resolution: resolution
                });

                var startTime = BASE_TIMESTAMP;
                var endTime = startTime + (resolution * sampleCount * 1000);
                var options = _generateOptions({
                    startTime: startTime,
                    endTime: endTime
                });

                var data = formatter.generateChartData(options);

                // Note - the number of samples may be slightly different based on start 
                // and end times.
                expect(data.labels).to.have.length(sampleCount);
            });

            it('should create labels at intervals defined by the resolution', function() {
                var resolution = 15;
                var sampleCount = 10;
                var formatter = _createFormatter({
                    resolution: resolution
                });

                var startTime = BASE_TIMESTAMP;
                var endTime = startTime + (resolution * sampleCount * 1000);
                var options = _generateOptions({
                    startTime: startTime,
                    endTime: endTime
                });

                var data = formatter.generateChartData(options);

                // Note - the number of samples may be slightly different based on start 
                // and end times.
                for (var index = 1; index < data.labels.length; index++) {
                    var firstLabel = data.labels[index - 1];
                    var nextLabel = data.labels[index];

                    expect(nextLabel - firstLabel).to.equal(resolution * 1000);
                }
            });

            it('should populate labels starting with the next interval slot greater than the start time', function() {
                var resolution = 15;
                var sampleCount = 10;
                var formatter = _createFormatter({
                    resolution: resolution
                });

                var startTime = BASE_TIMESTAMP - 2000;
                var endTime = startTime + (resolution * sampleCount * 1000);
                var options = _generateOptions({
                    startTime: startTime,
                    endTime: endTime
                });

                var data = formatter.generateChartData(options);

                expect(data.labels[0]).to.equal(BASE_TIMESTAMP);
            });

            it('should create labels that are not greater than the end time', function() {
                var resolution = 15;
                var sampleCount = 10;
                var formatter = _createFormatter({
                    resolution: resolution
                });

                var startTime = BASE_TIMESTAMP - 2000;
                var endTime = startTime + (resolution * sampleCount * 1000);
                var options = _generateOptions({
                    startTime: startTime,
                    endTime: endTime
                });

                var data = formatter.generateChartData(options);

                expect(data.labels[data.labels.length - 1]).to.be.at.most(endTime);
            });

            it('should use the lable formatter to format the label if one is specified', function() {
                var resolution = 15;
                var sampleCount = 10;
                var formatter = _createFormatter({
                    resolution: resolution
                });

                var startTime = BASE_TIMESTAMP;
                var endTime = startTime + (resolution * sampleCount * 1000);
                var formatLabelResponse = 'label 1234';
                var formatLabelSpy = _sinon.stub().returns(formatLabelResponse);
                var options = _generateOptions({
                    startTime: startTime,
                    endTime: endTime,
                    formatLabel: formatLabelSpy
                });

                var data = formatter.generateChartData(options);

                expect(formatLabelSpy).to.have.been.called;
                expect(formatLabelSpy.callCount).to.equal(data.labels.length);

                for (var index = 0; index < data.labels.length; index++) {
                    expect(data.labels[index]).to.equal(formatLabelResponse);
                }
            });
        });

        describe('[Series Generation]', function() {
            it('should populate series with the id of the data sets registered with the formatter', function() {
                var formatter = _createFormatter();
                var dataSetIds = ['test_set_1', 'test_set_2', 'test_set_3', 'test_set_4'];
                var options = _generateOptions();

                for (var index = 0; index < dataSetIds.length; index++) {
                    formatter.setDataSet(dataSetIds[index], []);
                }
                var data = formatter.generateChartData(options);

                expect(data.series).to.deep.equal(dataSetIds);
            });
        });

        describe('[Data Generation]', function() {

            it('should populate the series names with the data set names if specified', function() {
                var formatter = _createFormatter();
                var dataSetIds = ['test_set_1', 'test_set_2', 'test_set_3', 'test_set_4'];
                var dataSetNames = ['set 1', 'set 2', 'set 3', 'set 4'];
                var options = _generateOptions();

                for (var index = 0; index < dataSetIds.length; index++) {
                    formatter.setDataSet(dataSetIds[index], [], dataSetNames[index]);
                }
                var data = formatter.generateChartData(options);

                expect(data.series).to.deep.equal(dataSetNames);
            });

            it('should populate the series names with the data set ids if series names are not specified', function() {
                var formatter = _createFormatter();
                var dataSetIds = ['test_set_1', 'test_set_2', 'test_set_3', 'test_set_4'];
                var options = _generateOptions();

                for (var index = 0; index < dataSetIds.length; index++) {
                    formatter.setDataSet(dataSetIds[index], []);
                }
                var data = formatter.generateChartData(options);

                expect(data.series).to.deep.equal(dataSetIds);
            });

            it('should populate data with one array for every data set registered with the formatter', function() {
                var index = 0;
                var formatter = _createFormatter();
                var dataSetIds = ['test_set_1', 'test_set_2', 'test_set_3', 'test_set_4'];
                var options = _generateOptions();

                for (index = 0; index < dataSetIds.length; index++) {
                    formatter.setDataSet(dataSetIds[index], []);
                }
                var data = formatter.generateChartData(options);

                expect(data.data).to.have.length(dataSetIds.length);
                for (index = 0; index < data.data.length; index++) {
                    expect(data.data[index]).to.be.an('Array');
                }
            });

            it('should populate each child data array with as many elements as the labels', function() {
                var index = 0;
                var resolution = 15;
                var sampleCount = 10;
                var dataSetIds = ['test_set_1', 'test_set_2', 'test_set_3', 'test_set_4'];
                var formatter = _createFormatter({
                    resolution: resolution
                });

                var startTime = BASE_TIMESTAMP;
                var endTime = startTime + (resolution * sampleCount * 1000);
                var options = _generateOptions({
                    startTime: startTime,
                    endTime: endTime
                });

                for (index = 0; index < dataSetIds.length; index++) {
                    formatter.setDataSet(dataSetIds[index], []);
                }
                var data = formatter.generateChartData(options);

                for (index = 0; index < data.data.length; index++) {
                    expect(data.data[index]).to.have.length(data.labels.length);
                }
            });

            it('should populate null data points for intervals where the data set has no data', function() {
                var index = 0;
                var resolution = 15;
                var sampleCount = 10;
                var dataSetIds = ['test_set_1', 'test_set_2', 'test_set_3', 'test_set_4'];
                var formatter = _createFormatter({
                    resolution: resolution
                });

                var startTime = BASE_TIMESTAMP;
                var endTime = startTime + (resolution * sampleCount * 1000);
                var options = _generateOptions({
                    startTime: startTime,
                    endTime: endTime
                });

                for (index = 0; index < dataSetIds.length; index++) {
                    formatter.setDataSet(dataSetIds[index], []);
                }
                var data = formatter.generateChartData(options);

                for (index = 0; index < data.data.length; index++) {
                    for (var dpIndex = 0; dpIndex < data.data[index].length; dpIndex++) {
                        expect(data.data[index][dpIndex]).to.be.null;
                    }
                }
            });

            it('should populate the actual data point for intervals where the data set has data', function() {
                var index = 0;
                var resolution = 15;
                var sampleCount = 10;
                var dataSetIds = ['test_set_1', 'test_set_2', 'test_set_3', 'test_set_4'];
                var formatter = _createFormatter({
                    resolution: resolution,
                    groupingFunction: function(values) {
                        return (values instanceof Array) ? values[0] : null;
                    }
                });

                var startTime = BASE_TIMESTAMP;
                var endTime = startTime + (resolution * sampleCount * 1000);
                var options = _generateOptions({
                    startTime: startTime,
                    endTime: endTime
                });

                var dataSetData = [];
                var expectedData = [];
                var time = startTime;
                for (index = 0; index < sampleCount; index++) {
                    expectedData.push(index);
                    dataSetData.push({
                        timestamp: time,
                        value: index
                    });
                    time = time + (resolution * 1000);
                }

                for (index = 0; index < dataSetIds.length; index++) {
                    formatter.setDataSet(dataSetIds[index], dataSetData);
                }
                var data = formatter.generateChartData(options);

                for (index = 0; index < data.data.length; index++) {
                    expect(data.data[index]).to.deep.equal(expectedData);
                }
            });


        });

    });

});
