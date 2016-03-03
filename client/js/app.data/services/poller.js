'use strict';

var _inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

/**
 * Returns a poller object that can be used fetch periodically updated data from
 * a data source.
 */
module.exports = [ '$interval', function($interval) {

    /**
     * Poller object that can be used to periodically query a data source, and emit
     * an event every time data is retrieved from the data source.
     *
     * @class Poller
     * @constructor
     * @param {String} id A unique id for the poller. Events emitted by the
     *                  will include this id.
     * @param {Object} dataSource A data source object that will be polled for
     *                  data.
     */
    function Poller(id, dataSource) {
        if(typeof id !== 'string' || id.length <= 0) {
            throw new Error('Invalid id specified (arg #2)');
        }
        if(!dataSource || typeof dataSource !== 'object') {
            throw new Error('Invalid data source object specified (arg #3)');
        }
        if(typeof dataSource.serverFetch !== 'function') {
            throw new Error('Data source object does not define the serverFetch() method (dataSource.serverFetch())');
        }

        this._id = id;
        this._dataSource = dataSource;

        this._intervalHandle = null;
        this._pollFrequency = -1;
        this._isConfigured = false;

        Poller.super_.call(this);
    }

    _inherits(Poller, EventEmitter);

    /**
     * @class Poller
     * @method _createDsWrapper
     * @private
     */
    Poller.prototype._createDsWrapper = function() {
        var self = this;
        return function() {
            try {
                self._dataSource.serverFetch().then(function(data) {
                    self.emit('data', self._id, data);
                }, function(err) {
                    self.emit('error', self._id, err);
                });
            } catch(ex) {
                self.emit('error', self._id, ex);
            }
        };
    }

    /**
     * Configures the poller. This method can be used to specify poller properties
     * such as poll frequency, etc. If the poller is currently active, polling will be
     * restarted when invoked.
     *
     * @class Poller
     * @method configure
     * @param {Object} options An options object that defines the poller configuration.
     */
    Poller.prototype.configure = function(options) {
        if(!options || typeof options !== 'object') {
            throw new Error('Invalid configuration options specified (arg #1)');
        }
        if(typeof options.pollFrequency !== 'number' || options.pollFrequency <= 0) {
            throw new Error('Configuration options does not define a valid pollFrequency property (options.pollFrequency)');
        }

        this._pollFrequency = options.pollFrequency;
        this._isConfigured = true;
    };

    /**
     * Starts up the poller, triggering data source fetches at regular intervals. The
     * poller must be configured before this method is invoked.
     *
     * @class Poller
     * @method start
     */
    Poller.prototype.start = function() {
        if(!this._isConfigured) {
            throw new Error('Cannot perform operation - the poller has not been configured');
        }
        if(!this._intervalHandle) {
            this._intervalHandle = $interval(this._createDsWrapper(), this._pollFrequency);
        }
    };

    /**
     * Stops the poller if the poller is active. If not, this method has no effect.
     *
     * @class Poller
     * @method stop
     */
    Poller.prototype.stop = function() {
        if(this._intervalHandle) {
            $interval.cancel(this._intervalHandle);
        }
        this._intervalHandle = null;
    };

    /**
     * Destroys the poller, releasing all of its resources.
     *
     * @class Poller
     * @method destroy
     */
    Poller.prototype.destroy = function() {
        this.stop();
        this.removeAllListeners();
    };

    /**
     * Asks the poller to perform a fetch immediately, irrespective of the current
     * polling interval. If the poller is active, new configuration settings will take
     * effect only when the poller is restarted.
     *
     * @class Poller
     * @method fetchNow
     */
    Poller.prototype.fetchNow = function() {
        if(!this._isConfigured) {
            throw new Error('Cannot perform operation - the poller has not been configured');
        }
        var restart = (this._intervalHandle !== null);
        this.stop();

        var fetchWrapper = this._createDsWrapper();
        fetchWrapper();

        if(restart) {
            this.start();
        }
    };

    /**
     * Returns a boolean flag that determines whether or not the poller is currently
     * active.
     *
     * @class Poller
     * @method isActive
     */
    Poller.prototype.isActive = function() {
        return this._intervalHandle !== null;
    };

    return Poller;
} ];
