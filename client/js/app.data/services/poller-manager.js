'use strict';

/**
 * Factory that allows the creation and management of poller objects.
 */
module.exports = [ 'app.data.Poller', function(Poller) {
    var _pollerMap = { };

    function _deletePoller(id) {
        var poller = _pollerMap[id];
        if(poller) {
            poller.destroy();
            delete _pollerMap[id];
        }
    }
    return {
        /**
         * Creates and registers a new poller with the poller manager.
         *
         * @module app.data.pollerManager
         * @method initPoller
         * @param {String} id An identifier that uniquely identifies the poller
         * @param {Object} dataSource A datasource that will be polled by the poller
         * @returns {Object} A newly instantiated poller object.
         */
        initPoller: function(id, dataSource) {
            if(typeof id !== 'string' || id.length <= 0) {
                throw new Error('Invalid poller id specified (arg #1)');
            }
            if(!dataSource || typeof dataSource !== 'object') {
                throw new Error('Invalid data source object specified (arg #2)');
            }
            if(_pollerMap[id]) {
                throw new Error('A poller with the specified id [' + id +
                                '] has already been created');
            }
            var poller = new Poller(id, dataSource);
            _pollerMap[id] = poller;
            return poller;
        },

        /**
         * Looks up an existing poller based on the specified id. If a poller
         * with the specified id does not exist, undefined will be returned.
         *
         * @module app.data.pollerManager
         * @method lookupPoller
         * @param {String} id An identifier that uniquely identifies the poller
         * @returns {Object} An existing poller matching the specified id, or
         *              undefined if a poller does not exist for the specified id.
         */
        lookupPoller: function(id) {
            if(typeof id !== 'string' || id.length <= 0) {
                throw new Error('Invalid poller id specified (arg #1)');
            }
            return _pollerMap[id];
        },

        /**
         * Returns a list of the ids of all pollers registered with the poller
         * manager.
         *
         * @module app.data.pollerManager
         * @method getPollerIds
         * @returns {Array} An array of poller ids.
         */
        getPollerIds: function(id) {
            return Object.keys(_pollerMap);
        },

        /**
         * Removes an existing poller from the manager. If a poller with the
         * the specified id does not exist, this method will have no effect.
         * If a poller with the specified id exists and is active, it will be
         * stopped prior to deletion.
         *
         * @module app.data.pollerManager
         * @method deletePoller
         * @param {String} id An identifier that uniquely identifies the poller
         */
        deletePoller: function(id) {
            _deletePoller(id);
        },

        /**
         * Deletes all pollers registered with the manager.
         *
         * @module app.data.pollerManager
         * @method deleteAll
         */
        deleteAll: function() {
            var ids = Object.keys(_pollerMap);
            for(var index=0; index<ids.length; index++) {
                _deletePoller(ids[index]);
            }
        }
    };
} ];
