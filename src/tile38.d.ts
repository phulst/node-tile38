export = Tile38;
declare class Tile38 {
    constructor({ port, host, password, debug, logger }?: {
        port: any;
        host: any;
        password: any;
        debug?: boolean;
        logger?: Console;
    });
    port: any;
    host: any;
    password: any;
    logger: Console;
    client: any;
    debug: boolean;
    /**
     * convenience user function for sending commands that are not yet supported by this library.
     * Example use:
     *   client.executeCommand('SCRIPT LOAD MYSCRIPT');
     *
     * Most Tile38 return a json response with an ok=true property. By default, executeCommand will
     * return the value of this 'ok' property and thus return a boolean true.
     * To only return a different object from the Tile38 response:
     *   client.executeCommand('KEYS *', { returnProp: 'keys'})
     *
     * or to skip JSON parsing altogether and return the raw server response
     *   client.executeCommand('KEYS *', { parseJson: false })
     *
    */
    executeCommand(command: any, opts?: {}): any;
    sendCommand(cmd: any, returnProp: any, args: any): any;
    ping(): any;
    quit(): any;
    server(): any;
    gc(): any;
    configGet(prop: any): any;
    configSet(prop: any, value: any): any;
    configRewrite(): any;
    flushdb(): any;
    readOnly(val: any): any;
    bounds(key: any): any;
    expire(key: any, id: any, seconds: any): any;
    ttl(key: any, id: any): any;
    persist(key: any, id: any): any;
    rename(oldKey: any, newKey: any): any;
    renamenx(oldKey: any, newKey: any): any;
    keys(pattern: any): any;
    auth(password: any): any;
    set(key: any, id: any, obj: any, fields?: {}, opts?: {}): any;
    setString(key: any, id: any, obj: any, fields?: {}, opts?: {}): any;
    /**
     * Set the value for a one or more fields. This can be called in one of two ways:
     *     fset('fleet', 'truck1', 'speed', 16)
     * or to set multiple values:
     *     fset('fleet', 'truck1', { speed: 16, driver: 1224 })
     */
    fset(key: any, id: any, field: any, value: any): any;
    del(key: any, id: any): any;
    pdel(key: any, pattern: any): any;
    get(key: any, id: any, { withfields, type }?: {
        withfields?: boolean;
        type?: any;
    }): any;
    getPoint(key: any, id: any, opts?: {}): any;
    getBounds(key: any, id: any, opts?: {}): any;
    getHash(key: any, id: any, opts?: {}): any;
    drop(key: any): any;
    stats(...keys: any[]): any;
    jset(key: any, id: any, jKey: any, jVal: any): any;
    jget(key: any, id: any, ...other: any[]): any;
    jdel(key: any, id: any, jKey: any): any;
    intersectsQuery(key: any): Query;
    searchQuery(key: any): Query;
    nearbyQuery(key: any): Query;
    scanQuery(key: any): Query;
    withinQuery(key: any): Query;
    setHook(name: any, endpoint: any, meta: any, searchType: any, key: any, opts: any): any;
    hooks(pattern?: string): any;
    delhook(name: any): any;
    pdelhook(pattern: any): any;
    openLiveFence(command: any, commandArr: any, callback: any): LiveGeofence;
    redisEncodeCommand(command: any, arr: any): string;
}
import Query = require("./tile38_query");
import LiveGeofence = require("./live_geofence");
