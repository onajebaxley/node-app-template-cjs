'use strict';

/**
 * Returns a formatter object that formats time series data for representation
 * on a chart.
 */
module.exports = [ function() {

    /**
     * Class that helps convert raw time series data into a format that is better
     * suited for reporting on charts. Multiple data sets may may be added to the
     * formatter, which will group data points into uniform intervals using a
     * grouping function, generating data that can be directly attached to a chart.
     *
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @constructor
     * @param {Object} options An options object that defines the behavior of the
     *                  chart data object.
     */
    function TimeSeriesDataFormatter(options) {
        if(!options || typeof options !== 'object') {
            throw new Error('Invalid options specified (arg #1)');
        }
        if(typeof options.groupingFunction !== 'function') {
            throw new Error('Invalid grouping function specified (options.groupingFunction)');
        }
        if(options.resolution &&
           (typeof options.resolution !== 'number' || options.resolution <= 0)) {
            throw new Error('Invalid resolution specified. Must be a positive number (options.resolution)');
        }

        this._resolution = options.resolution || TimeSeriesDataFormatter.DEFAULT_RESOLUTION;
        this._groupingFunction = options.groupingFunction;

        this._dataSets = { };
    }

    /**
     * The default resolution for the formatter (in seconds).
     *
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @property DEFAULT_RESOLUTION
     * @type Number
     * @static
     * @readOnly
     */
    TimeSeriesDataFormatter.DEFAULT_RESOLUTION = 15;

    /**
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @method _getNextInterval
     * @private
     */
    TimeSeriesDataFormatter.prototype._getNextInterval = function(date) {
        date = new Date(date);
        var seconds = parseInt(date.getTime()/1000);
        var delta = (this._resolution - (seconds % this._resolution));

        return new Date((seconds + delta) * 1000);
    };

    /**
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @method _prepareDataForChart
     * @private
     */
    TimeSeriesDataFormatter.prototype._prepareDataForChart = function(data) {
        var groupMap = {}

        for(var index=0; index<data.length; index++) {
            var item = data[index];
            //item.timestamp = item.timestamp * 1000;
            var intervalTimestamp = this._getNextInterval(item.timestamp);
            var key = intervalTimestamp.getTime();
            var group = groupMap[key];

            if(!group) {
                group = {
                    key: key,
                    groupedValues: []
                }
                groupMap[key] = group;
            }
            group.groupedValues.push(item.value);
        };

        for(var key in groupMap) {
            var group = groupMap[key];
            group.value = this._groupingFunction(group.groupedValues);

        }

        return groupMap;
    };

    /**
     * Adds a new data set (or updates an existing one) on the formatter.
     *
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @method setDataSet
     * @param {String} id The id of the dataset
     * @param {Array} data An array of data points (key/value pairs) for the senor
     * @param {String} [setName] An optional data set name. The id will be used if this field is
     *                  not specified.
     */
    TimeSeriesDataFormatter.prototype.setDataSet = function(id, data, setName) {
        if(typeof id !== 'string' || id.length <=0) {
            throw new Error('Invalid data set id specified (arg #1)');
        }
        if(!(data instanceof Array)) {
            throw new Error('Invalid data specified (arg #2)');
        }

        var dataSet = this._dataSets[id];
        if(!dataSet) {
            dataSet = {};
            this._dataSets[id] = dataSet;
        }
        dataSet.name = (typeof setName === 'string')? setName:id;

        dataSet.rawData = data;
        dataSet.chartData = this._prepareDataForChart(dataSet.rawData);
    };

    /**
     * Removes an existing data set from the formatter.
     *
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @method removeDataSet
     * @param {String} id The id of the dataset
     */
    TimeSeriesDataFormatter.prototype.removeDataSet = function(id) {
        if(typeof id !== 'string' || id.length <=0) {
            throw new Error('Invalid data set id specified (arg #1)');
        }

        var dataSet = this._dataSets[id];
        if(dataSet) {
            delete this._dataSets[id];
        }
    };

    /**
     * Updates the resolution used to generate the chart data. This method
     * will regroup all existing data sets when invoked.
     *
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @method setGroupingFunction
     * @param {Number} resolution The new resolution to set
     */
    TimeSeriesDataFormatter.prototype.setResolution = function(resolution) {
        if(typeof resolution !== 'number' || resolution <= 0) {
            throw new Error('Invalid resolution specified. Must be a positive number (arg #1)');
        }
        this._resolution = resolution;

        // Update all data sets.
        for(var id in this._dataSets) {
            var dataSet = this._dataSets[id];
            dataSet.chartData = this._prepareDataForChart(dataSet.rawData);
        }
    };

    /**
     * Updates the grouping function used to generate the chart data. This method
     * will regroup all existing data sets when invoked.
     *
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @method setGroupingFunction
     * @param {Function} groupingFunction A grouping function that will be used to
     *                      reduce grouped data points to a single data point.
     */
    TimeSeriesDataFormatter.prototype.setGroupingFunction = function(groupingFunction) {
        if(typeof groupingFunction !== 'function') {
            throw new Error('Invalid grouping function specified (arg #1)');
        }
        this._groupingFunction = groupingFunction;

        // Update all data sets.
        for(var id in this._dataSets) {
            var dataSet = this._dataSets[id];
            dataSet.chartData = this._prepareDataForChart(dataSet.rawData);
        }
    };

    /**
     * Generates data that can readily be plugged into a chart.
     *
     * @module app.data.TimeSeriesDataFormatter
     * @class TimeSeriesDataFormatter
     * @method generateChartData
     * @param {Object} options An options hash that specifies how the chart has to be
     *                  generated.
     * @return {Object} A combined data set containing three properties - labels,
     *          series, data.
     */
    TimeSeriesDataFormatter.prototype.generateChartData = function(options) {
        if(!options || typeof options !== 'object') {
            throw new Error('Invalid options specified (arg #1)');
        }

        var startTime = new Date(options.startTime);
        if(!options.startTime || isNaN(startTime.getTime())) {
            throw new Error('Options does not define a valid start time (options.startTime)');
        }

        var endTime = new Date(options.endTime);
        if(!options.endTime || isNaN(endTime.getTime())) {
            throw new Error('Options does not define a valid end time (options.endTime)');
        }
        if(endTime.getTime() < startTime.getTime()) {
            throw new Error('End time cannot be earlier than start time');
        }

        var formatLabel = options.formatLabel;
        if(typeof formatLabel !== 'function') {
            formatLabel = function(label) {
                return label;
            }
        }

        var payload = {
            labels: [],
            series: [],
            data: []
        };

        // Load up series
        var id = null;
        var seriesIndexes = [];
        for(id in this._dataSets) {
            seriesIndexes.push(id);
            payload.series.push(this._dataSets[id].name);
            payload.data.push([]);
        }

        var label = this._getNextInterval(options.startTime).getTime();
        do {
            payload.labels.push(formatLabel(label));

            for(var index=0; index<seriesIndexes.length; index++) {
                id = seriesIndexes[index];
                var chartData = this._dataSets[id].chartData;

                var dataPoint = chartData[label];
                dataPoint = (typeof dataPoint === 'undefined')? null:dataPoint.value;
                payload.data[index].push(dataPoint);
            }

            label = new Date(label + (this._resolution * 1000));
            label = label.getTime();
        }
        while(label <= endTime);
        return payload;
    };

    return TimeSeriesDataFormatter;
} ];
