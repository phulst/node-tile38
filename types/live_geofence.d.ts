export = LiveGeofence;
/**
 * establishes an open socket to the Tile38 server for live geofences
 */
declare class LiveGeofence {
    constructor(debug?: boolean, logger?: Console);
    debug: boolean;
    logger: Console;
    /**
     * opens a socket to the server, submits a command, then continuously processes data that is returned
     * from the Tile38 server
     * @param host
     * @param port
     * @param password
     * @param command Command string to send to Tile38
     * @param callback callback method with parameters (err, results)
     */
    open(host: any, port: any, password: any, command: any, callback: any): LiveGeofence;
    socket: any;
    onClose(callback: any): void;
    onCloseCb: any;
    close(): void;
}
