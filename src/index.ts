import { Tile38Config } from "./config";
import { CoreClient } from "./core";
import {
    AnyRedisResponse,
    Tile38Command,
    Tile38Coord,
    Tile38GetOptions,
    Tile38HashType,
    Tile38Id,
    Tile38Key,
    Tile38SetOptions,
} from "./core";
import { QueryFactory } from "./core/queryFactory";


export class Tile38 extends CoreClient {

    public factory: QueryFactory;

    constructor(config?: Partial<Tile38Config>) {
        super(config);
        this.factory = new QueryFactory(this.config, this.client);
    }

    public async ping(): Promise<string> {
        return await this.executeForSingleField<{ ping: string }>("PING", "ping");
    }

    public async quit(): Promise<AnyRedisResponse> {
        return await this.execute("QUIT");
    }

    public async server() {
        return await
            this.executeForSingleField<{ stats: string }>("SERVER", "stats")
    }

    public async gc(): Promise<AnyRedisResponse> {
        return await this.execute("GC");
    }

    public async configGet(property: string): Promise<any> {
        return await
            this.executeForSingleField<{ properties: any }>("SERVER", "properties", property)
    }

    // sets a configuration value in the database. Will return true if successful.
    // Note that the value does not get persisted until configRewrite is called.
    public async configSet(property: string, value: number | boolean | string): Promise<boolean> {
        return await this.executeForOK("CONFIG SET", property, value);
    }

    // flushes all data from the db. Will return true value if successful
    public async flushDb() {
        return await this.executeForOK("FLUSHDB");
    }

    // turns on or off readonly mode. (Pass true value to turn on)
    public async readOnly(readonly = true) {
        return await this.executeForOK("READONLY", readonly ? "yes" : "no")
    }

    // Returns the minimum bounding rectangle for all objects in a key.
    public async bounds(key: Tile38Key) {
        return await this.executeForSingleField<{ bounds: any }>("BOUNDS", "bounds", key);
    }

    public async expire(key: Tile38Key, id: Tile38Id, seconds: number) {
        return await this.executeForOK("EXPIRE", key, id, seconds);
    }

    public async ttl(key: Tile38Key, id: Tile38Id) {
        return await this.executeForSingleField("TTL", "ttl", key, id);
    }

    public async persist(key: Tile38Key, id: Tile38Id) {
        return await this.executeForOK("PERSIST", key, id);
    }

    public async keys(pattern: string) {
        return await this.executeForSingleField("KEYS", "keys", pattern);
    }

    public async auth(password: string) {
        return await this.executeForOK("AUTH", password);
    }

    public async set<T>(key: Tile38Key, id: Tile38Id, coord: Tile38Coord, fields: T | {} = {}, options: Tile38SetOptions = {}) {
        const args: (number | string | Tile38Command | Tile38Coord)[] = [key, id];

        // Add the fields to the map
        Object.keys(fields).map(key => args.push("FIELD", key, (fields as any)[key]))

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

    // convenience method for set() with options.type = 'string'
    public async setString<T>(key: Tile38Key, id: Tile38Id, coord: string, fields: T | {} = {}, options: Tile38SetOptions = {}) {
        return await this.set(key, id, coord, fields, { ...options, type: "string" });
    }

    // Set the value for a single field of an id.
    public async fset(key: Tile38Key, id: Tile38Id, field: string, value: number | string) {
        return await this.executeForOK("FSET", key, id, field, value);
    }

    // Delete an id from a key
    public async del(key: Tile38Key, id: Tile38Id) {
        return await this.executeForOK("DEL", key, id);
    }

    // Removes objects that match a specified pattern.
    public async pdel(key: Tile38Key, pattern: any) {
        return await this.executeForOK("PDEL", key, pattern);
    }

    /**
     *      * Get the object of an id. The default output format is a GeoJSON object.
     *
     *   The options hash supports 2 properties:
     *   type: (POINT, BOUNDS, HASH, OBJECT)  the type in which to return the ID. Defaults to OBJECT
     *   withfields:  boolean to indicate whether or not fields should be returned. Defaults to false
     *
     * examples:
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

    // shortcut for GET method with output POINT
    public async getPoint(key: Tile38Key, id: Tile38Id) {
        return await this.get(key, id, { type: "POINT" })
    }

    // shortcut for GET method with output BOUNDS
    public async getBounds(key: Tile38Key, id: Tile38Id) {
        return await this.get(key, id, { type: "BOUNDS" })
    }

    // shortcut for GET method with output HASH
    public async getHash(key: Tile38Key, id: Tile38Id, precision = 6) {
        return await this.get(key, id, { type: `HASH ${precision}` as Tile38HashType });
    }

    // Remove all objects from specified key.
    public async drop(key: Tile38Key) {
        return await this.executeForOK("DROP", key);
    }

    // Return stats for one or more keys.
    public async stats(...keys: Tile38Key[]) {
        return await this.executeForSingleField("STATS", "stats", keys);
    }

    // Set a value in a JSON document
    public async jset(key: Tile38Key, id: Tile38Id, jKey: string, jVal: any) {
        return await this.executeForOK("JSET", [key, id, jKey, jVal]);
    }

    // Get a value from a json document
    public async jget(key: Tile38Key, id: Tile38Id, ...args: (string | number)[]) {
        return await this.executeForSingleField("JGET", "value", ...[key, id, ...args]);
    }

    // Delete a json value
    public async jdel(key: Tile38Key, id: Tile38Id, jKey: string) {
        return this.executeForOK("JDEL", key, id, jKey);
    }
}
