'use strict';

var _clone = require('clone');

/**
 * Returns a message block class that is intended to be bound to the UI, with
 * methods exposed to set and clear message content.
 */
module.exports = [ function() {

     /**
      * Represents a message block with methods that allow setting/clearing of
      * messages, and utility methods that can be used to determine whether or
      * not the message block has to be shown.
      *
      * @module app.layout.MessageBlock
      * @class MessageBlock
      * @constructor
      */
    function MessageBlock() {
        this.message = '';
        this.severity = '';
    }

    /**
     * Clears an existing message.
     *
     * @class MessageBlock
     * @method clear
     */
    MessageBlock.prototype.clear = function() {
        this.message = '';
        this.severity = '';
    };

    /**
     * Sets a message with severity 'info'.
     *
     * @class MessageBlock
     * @method info
     * @param {String} message The message to set.
     */
    MessageBlock.prototype.info = function(message) {
        message = message || '';
        this.message = message;
        this.severity = 'info';
    };

    /**
     * Sets a message with severity 'warning'.
     *
     * @class MessageBlock
     * @method warning
     * @param {String} message The message to set.
     */
    MessageBlock.prototype.warning = function(message) {
        message = message || '';
        this.message = message;
        this.severity = 'warning';
    };

    /**
     * Sets a message with severity 'error'.
     *
     * @class MessageBlock
     * @method error
     * @param {String} message The message to set.
     */
    MessageBlock.prototype.error = function(message) {
        message = message || '';
        this.message = message;
        this.severity = 'error';
    };

    /**
     * Determines whether or not the object has a message to be shown.
     *
     * @class MessageBlock
     * @method hasMessage
     * @return {Boolean} true if a valid message has been set,
     *          false otherwise.
     */
    MessageBlock.prototype.hasMessage = function() {
        return (typeof this.message === 'string' &&
                this.message.length > 0);
    };

    return MessageBlock;
} ];
