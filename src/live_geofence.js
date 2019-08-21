'use strict';

const net = require('net');
const Parser = require("redis-parser");

/**
 * establishes an open socket to the Tile38 server for live geofences
 */
class LiveGeofence {

    constructor(debug = false, logger = console) {
        this.debug = debug;
        this.logger = logger;
    }

    /**
     * opens a socket to the server, submits a command, then continuously processes data that is returned
     * from the Tile38 server
     * @param host
     * @param port
     * @param password
     * @param command Command string to send to Tile38
     * @param callback callback method with parameters (err, results)
     */
    open(host, port, password, command, callback) {
        const socket = new net.Socket();
        this.socket = socket;
        socket.connect(port, host, () => {
            if (password) {
                // authenticate if necessary
                socket.write(`AUTH ${password}\r\n`);
            }
            socket.write(command + "\r\n");
        });

        let self = this;
        socket.on('close', () => {
            //this.logger.log("Socket is being closed!");
            if (this.onCloseCb) this.onCloseCb();
        });

        const parser = new Parser({
            returnReply: function(reply) {
                if (self.debug) self.logger.log(reply);
                if (reply == 'OK') return; // we're not invoking a callback for the 'OK' response that comes first

                let response = reply;
                let f = reply.charAt(0);
                if (f == '{' || f == '[') {
                    // this smells like json, so try to parse it
                    try {
                        response = JSON.parse(reply);
                    } catch (err) {
                        self.logger.warn("Unable to parse server response: " + reply);
                        // we'll return the reply as-is.
                    }
                }
                callback(null, response);
            },
            returnError: function(err) {
                self.logger.error('live socket error: ' + err);
                callback(err, null);
            },
            returnFatalError: function(err) {
                self.logger.error('fatal live socket error: ' + err);
                self.socket.destroy();
                callback(err, null);
            }
        });

        socket.on('data', buffer => {
            //self.logger.log(JSON.stringify(buffer.toString()));
            parser.execute(buffer);
        });
       return this;
    }

    // allows clients to register an 'on closed' handler to be notified if the socket unexpectedly gets closed
    onClose(callback) {
        this.onCloseCb = callback;
    }

    // Forces the geofence to be closed
    close() {
        if (this.socket) this.socket.destroy();
    }
}

module.exports = LiveGeofence;
