export = Tile38Query;
declare class Tile38Query {
    static intersects(key: any): Tile38Query;
    static search(key: any): Tile38Query;
    static nearby(key: any): Tile38Query;
    static scan(key: any): Tile38Query;
    static within(key: any): Tile38Query;
    constructor(type: any, key: any, client: any);
    type: any;
    key: any;
    client: any;
    options: {};
    cursor(start: any): Tile38Query;
    limit(count: any): Tile38Query;
    sparse(spread: any): Tile38Query;
    match(value: any): Tile38Query;
    order(val: any): Tile38Query;
    asc(): Tile38Query;
    desc(): Tile38Query;
    distance(): Tile38Query;
    where(field: any, ...criteria: any[]): Tile38Query;
    whereIn(field: any, ...values: any[]): Tile38Query;
    whereEval(script: any, ...args: any[]): Tile38Query;
    whereEvalSha(sha: any, ...args: any[]): Tile38Query;
    clip(): Tile38Query;
    nofields(): Tile38Query;
    detect(...values: any[]): Tile38Query;
    /**
     * sets commands to listen for. Expected values: del, drop and set
     * You may pass these as separate parameters,
     *   query.commands('del', 'drop', 'set');
     *
     * or as a single comma separated parameter
     *   query.commands('del,drop,set');
     */
    commands(...values: any[]): Tile38Query;
    /**
     * set output type. Allowed values:
     * count
     * ids
     * objects
     * points
     * bounds
     * hashes
     *
     * If 'hashes' is used a second parameter should specify the precision, ie
     *   query.output('hashes', 6);
     *
     * Note that all of these types, except for 'bounds' can be called using convenience methods as well,
     * so
     *   objects() instead of output('objects')
     * and
     *   hashes(6) instead of output('hashes', 6)
     *
     */
    output(type: any, precision: any): Tile38Query;
    ids(): Tile38Query;
    count(): Tile38Query;
    objects(): Tile38Query;
    points(): Tile38Query;
    hashes(precision: any): Tile38Query;
    nodwell(): Tile38Query;
    timeout(secs: any): Tile38Query;
    /**
     * conducts search with an object that's already in the database
     */
    getObject(key: any, id: any): Tile38Query;
    /**
     * conducts search with bounds coordinates
     */
    bounds(minlat: any, minlon: any, maxlat: any, maxlon: any): Tile38Query;
    /**
     * conducts search with geojson object
     */
    object(geojson: any): Tile38Query;
    tile(x: any, y: any, z: any): Tile38Query;
    quadKey(key: any): Tile38Query;
    hash(geohash: any): Tile38Query;
    circle(lat: any, lon: any, meters: any): Tile38Query;
    point(lat: any, lon: any, meters: any): Tile38Query;
    roam(key: any, pattern: any, meters: any): Tile38Query;
    commandStr(): string;
    commandArr(): any[];
    /**
     * will execute the query and return a Promise to the result.
     * To use the live fence with streaming results, use fence() instead.
     */
    execute(): any;
    /**
     * returns streaming results for a live geofence. This function will repeatedly call the specified callback
     * method when results are received.
     * This method returns an instance of LiveGeofence, which can be used to close the fence if necessary by calling
     * its close() method.
     */
    executeFence(callback: any): any;
}
