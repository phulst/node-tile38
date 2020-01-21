import { Point, Polygon } from "geojson";

import { Tile38Config } from "./config";
import {
    BaseTile38Response,
    CoreClient,
    Tile38ConfigProperties,
    Tile38ConfigProperty,
    Tile38Hook,
    Tile38Pong,
    Tile38Stats,
} from "./core";
import { Tile38Command, Tile38Coord, Tile38GetOptions, Tile38HashType, Tile38Id, Tile38Key, Tile38SetOptions } from "./core";
import { QueryFactory } from "./core/queryFactory";


export class Tile38 extends CoreClient {

    public factory: QueryFactory;

    /**
     * Construct a new Tile38 client instance
     * 
     * @param config 
     */
    constructor(config?: Partial<Tile38Config>) {
        super(config);
        this.factory = new QueryFactory(this.config, this.client);
    }

    /**
     * Pings the server.
     * 
     * @returns pong
     */
    public async ping(): Promise<Tile38Pong> {
        return await this.executeForSingleField<{ ping: Tile38Pong }>("PING", "ping");
    }

    /**
     * Quit the client.
     */
    public async quit(): Promise<BaseTile38Response> {
        return await this.execute("QUIT");
    }

    /**
     * Return the server stats.
     * 
     * @returns stats
     */
    public async server(): Promise<Tile38Stats> {
        return await
            this.executeForSingleField<{ stats: Tile38Stats }>("SERVER", "stats")
    }

    /**
     * Call the garbage collection.
     * 
     * @returns True when suceeded
     */
    public async gc(): Promise<boolean> {
        return await this.executeForOK("GC");
    }

    /**
     * Return a config property
     * @param property 
     */
    public async configGet(property: Tile38ConfigProperty): Promise<string | number> {
        const config = await
            this.executeForSingleField<{ properties: Tile38ConfigProperties }>("SERVER", "properties", property)

        return config[property];
    }

    /**
     * ets a configuration value in the database. Will return true if successful.
    // Note that the value does not get persisted until configRewrite is called.

     * @param property 
     * @param value 
     * @returns True when succeeded
     */
    public async configSet(property: string, value: number | boolean | string): Promise<boolean> {
        return await this.executeForOK("CONFIG SET", property, value);
    }

    /**
     * Flushes all data from the db. Will return true value if successful.
     * 
     * @returns True when succeeded
     */
    public async flushDb() {
        return await this.executeForOK("FLUSHDB");
    }

    /**
     * Turns on or off readonly mode. (Pass true value to turn on)
     * @param readonly 
     * @returns True when succeeded
     */
    public async readOnly(readonly = true) {
        return await this.executeForOK("READONLY", readonly ? "yes" : "no")
    }

    /**
     * Returns the stats for a given key
     * 
     * @param key 
     */
    public async stats(key: Tile38Key) {
        return await this.executeForSingleField<{ stats: Tile38Stats }>("STATS", "stats", key);
    }

    /**
     * Returns the minimum bounding rectangle for all objects in a key.

     * @param key 
     * @returns GeoJSON polygon
     */
    public async bounds(key: Tile38Key): Promise<GeoJSON.Polygon> {
        return await this.executeForSingleField<{ bounds: GeoJSON.Polygon }>("BOUNDS", "bounds", key);
    }

    /**
     * Set a ttl on a record
     * 
     * @param key 
     * @param id 
     * @param seconds 
     * @returns TTL in seconds
     */
    public async expire(key: Tile38Key, id: Tile38Id, seconds: number) {
        return await this.executeForOK("EXPIRE", key, id, seconds);
    }

    /**
     * Get a timeout on an id in seconds.
     * 
     * @param key 
     * @param id 
     * @returns TTL of the object
     */
    public async ttl(key: Tile38Key, id: Tile38Id): Promise<number> {
        return await this.executeForSingleField<{ ttl: number }>("TTL", "ttl", key, id);
    }

    /**
     * Remove a timeout on a id.
     * 
     * @param key 
     * @param id 
     * @returns True when succeeded
     */
    public async persist(key: Tile38Key, id: Tile38Id) {
        return await this.executeForOK("PERSIST", key, id);
    }

    /**
     * Returns all keys matching pattern.
     * 
     * Supported glob-style patterns: 
     *  h?llo matches hello, hallo and hxllo 
     *  h*llo matches hllo and heeeello 
     *  h[ae]llo matches hello and hallo, but not hillo 
     *  h[^e]llo matches hallo, hbllo, … but not hello 
     *  h[a-b]llo matches hallo and hbllo
     * 
     * @param pattern 
     * @returns array of keys
     */
    public async keys(pattern: string | "*") {
        return await this.executeForSingleField<{ keys: string[] }>("KEYS", "keys", pattern);
    }

    /**
     * Sets the authentication password
     * 
     * @param password 
     * @returns True when succeeded
     */
    public async auth(password: string) {
        return await this.executeForOK("AUTH", password);
    }

    /**
     * Set the value of an id. If a value is already associated to that key/id, it’ll be overwritten.
     * This is a big function. Read also the online documentation:
     * https://tile38.com/commands/set/
     * 
     * @param key 
     * @param id 
     * @param coord 
     * @param fields 
     * @param options 
     * @returns True when succeedd
     */
    public async set<T>(key: Tile38Key, id: Tile38Id, coord: Tile38Coord, fields: T | {} = {}, options: Tile38SetOptions = {}) {
        const args: (number | string | Tile38Command | Tile38Coord)[] = [key, id];

        // Add the fields to the map
        Object.keys(fields).map(key => args.push("FIELD", key, (fields as { [key: string]: Tile38Coord })[key]))

        if (options.expire && options.expire > 0) {
            args.push("EX", options.expire);
        }

        if (options.onlyIfNotExists) {
            args.push("NX");
        }

        if (options.onlyIfExists) {
            args.push("XX");
        }

        // Sort out the coord object to the correct command equivalent
        if (Array.isArray(coord)) {
            if (coord.length > 1 && coord.length < 5) {
                args.push(coord.length === 4 ? "BOUNDS" : "POINTS", ...coord);
            } else {
                throw Error(`Incorrect number of values ${coord.length}`);
            }
        } else if (typeof coord === "string") {
            if (options.type === "string") {
                args.push("STRING", coord);
            } else {
                args.push("HASH", coord);
            }
        } else {
            args.push("OBJECT", coord);
        }

        // Return the command
        return await this.executeForOK("SET", args);
    }

    /**
     * Convenience method for set() with options.type = 'string'
     * 
     * @param key 
     * @param id 
     * @param coord 
     * @param fields 
     * @param options 
     */
    public async setString<T>(key: Tile38Key, id: Tile38Id, coord: string, fields: T | {} = {}, options: Tile38SetOptions = {}) {
        return await this.set(key, id, coord, fields, { ...options, type: "string" });
    }

    /**
     * Set the value for a single field of an id.
     * 
     * @param key 
     * @param id 
     * @param field 
     * @param value 
     */
    public async fset(key: Tile38Key, id: Tile38Id, field: string, value: number | string) {
        return await this.executeForOK("FSET", key, id, field, value);
    }

    /**
     * Delete an id from a key
     * 
     * @param key 
     * @param id 
     */
    public async del(key: Tile38Key, id: Tile38Id) {
        return await this.executeForOK("DEL", key, id);
    }

    /**
     * Removes objects that match a specified pattern.
     * 
     * @param key 
     * @param pattern 
     */
    public async pdel(key: Tile38Key, pattern: unknown) {
        return await this.executeForOK("PDEL", key, pattern);
    }

    /**
     * Get the object of an id. The default output format is a GeoJSON object.
     *
     * The options hash supports 2 properties:
     * type: (POINT, BOUNDS, HASH, OBJECT)  the type in which to return the ID. Defaults to OBJECT
     * withfields:  boolean to indicate whether or not fields should be returned. Defaults to false
     *
     * Examples:
     *   get('fleet', 'truck1')                    // returns geojson point
     *   get('fleet', 'truck1', {withfields: true} // include FIELDS
     *   get('fleet', 'truck1', {type: 'POINT'})   // same as above
     *   get('fleet', 'truck1', {type: 'BOUNDS'})  // return bounds
     *   get('fleet', 'truck1', {type: 'HASH 6'}) // return geohash with precision 6
     * 
     * @param key 
     * @param id 
     * @param options 
     */
    public async get<T>(key: Tile38Key, id: Tile38Id, options: Tile38GetOptions = {}) {
        const args: (number | string | Tile38Command | Tile38Coord)[] = [key, id];
        if (options.withFields) {
            args.push("WITHFIELDS");
        }

        if (options.type && options.type.startsWith("HASH")) {
            args.push(...options.type.split(" "));
        } else if (options.type) {
            args.push(options.type);
        }

        return await this.executeForObject<T>("GET", args);
    }

    /**
     * Shortcut for GET method with output POINT
     * @param key 
     * @param id 
     */
    public async getPoint(key: Tile38Key, id: Tile38Id) {
        return await this.get<Point>(key, id, { type: "POINT" })
    }

    /**
     * shortcut for GET method with output BOUNDS
     * 
     * @param key 
     * @param id 
     * @returns Polygon
     */
    public async getBounds(key: Tile38Key, id: Tile38Id) {
        return await this.get<Polygon>(key, id, { type: "BOUNDS" })
    }

    /**
     * Shortcut for GET method with output HASH
     * 
     * @param key 
     * @param id 
     * @param precision 
     * @returns geohash as a string
     */
    public async getHash(key: Tile38Key, id: Tile38Id, precision = 6) {
        return await this.get<string>(key, id, { type: `HASH ${precision}` as Tile38HashType });
    }

    /**
     * Remove all objects from specified key.
     * 
     * @param key 
     * @returns True when succeeded
     */
    public async drop(key: Tile38Key) {
        return await this.executeForOK("DROP", key);
    }

    /**
     * Set a value in a JSON document
     * 
     * @param key 
     * @param id 
     * @param jKey 
     * @param jVal 
     */
    public async jset(key: Tile38Key, id: Tile38Id, jKey: string, jVal: unknown) {
        return await this.executeForOK("JSET", [key, id, jKey, jVal]);
    }

    /**
     * Get a value from a json document
     * 
     * @param key 
     * @param id 
     * @param args 
     */
    public async jget(key: Tile38Key, id: Tile38Id, ...args: (string | number)[]) {
        return await this.executeForSingleField("JGET", "value", ...[key, id, ...args]);
    }

    /**
     * Delete a json value
     * @param key 
     * @param id 
     * @param jKey 
     */
    public async jdel(key: Tile38Key, id: Tile38Id, jKey: string) {
        return this.executeForOK("JDEL", key, id, jKey);
    }

    /**
     * Get all hooks with the matching pattern.
     * 
     * @param pattern 
     */
    public async hooks(pattern: string | "*" = "*") {
        return await this.executeForSingleField<{ hooks: Tile38Hook[] }>("HOOKS", "hooks", pattern);
    }

    /**
     * Set a hook. Full documentation can be found here:
     * https://tile38.com/commands/sethook/
     * 
     * @param name 
     * @param endpoint 
     * @param command 
     * @param key 
     * @param meta default {}
     * @param fenceOpts 
     * @returns True when succeeded
     */
    public async setHook(name: string, endpoint: string, command: Tile38Command, key: Tile38Key, meta: { [name: string]: string | number | boolean } = {}, ...fenceOpts: string[]) {
        // Base command
        const args = [name, endpoint];

        // Add metadata
        if (Object.keys(meta).length > 0) {
            args.push("META");
            Object.keys(meta).forEach((metaKey) => args.push(metaKey, meta[metaKey].toString()));
        }

        // Add the key
        args.push(key);

        // Add the query
        args.push("FENCE", ...fenceOpts);

        return await this.executeForOK("SETHOOK", ...args);
    }

    /**
     * Delete a hook
     * 
     * @param name 
     * @returns True when succeeded
     */
    public async delHook(name: string) {
        return await this.executeForOK("DELHOOK", name);
    }

    /**
     * Delete a hook. Supported glob-style patterns: 
     *  h?llo matches hello, hallo and hxllo 
     *  h*llo matches hllo and heeeello 
     *  h[ae]llo matches hello and hallo, but not hillo 
     *  h[^e]llo matches hallo, hbllo, … but not hello 
     *  h[a-b]llo matches hallo and hbllo
     * 
     * @param name 
     * @returns True when succeeded
     */
    public async pdelHook(pattern: string) {
        return await this.executeForOK("PDELHOOK", pattern);
    }
}
