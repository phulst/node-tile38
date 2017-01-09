
// const Redis = require('ioredis');
const redis = require('redis');
const Promise = require('bluebird');

// const Command = Redis.Command;

class Tile38 {

    constructor() {
        this.client = redis.createClient({
            port:   9851,
            host:   'localhost'
        });
        // put the OUTPUT in json mode
        this.sendCommand('OUTPUT', null, 'json');
        this.debug = false;
    }

    /*
     * send a command with optional arguments to the Redis driver, and return the response in a Promise.
     * If returnProp is set, it will assume that the response is a JSON string, then parse and return
     * the given property from that string.
     */
    sendCommand(cmd, returnProp, ...args) {
        return new Promise((resolve, reject) => {
            if (this.debug) {
                console.log(`sending command "${cmd} ${args.join(' ')}"`);
            }
            this.client.send_command(cmd, args, (err, result) => {
                if (err) {
                    if (this.debug) {
                        console.log(err);
                    }
                    reject(err);
                } else {
                    if (this.debug) {
                        console.log(result);
                    }
                    try {
                        if (!returnProp) {
                            // return the raw response
                            resolve(result);
                        } else {
                            let res = JSON.parse(result);
                            if (!res.ok) {
                                if (res.err) {
                                    reject(res.err);
                                } else {
                                    reject(`unexpected response: ${result}`);
                                }
                            } else {
                                resolve(res[returnProp]);
                            }
                        }
                    } catch (error) {
                        reject(`unable to parse response: ${result}`);
                    }
                }
            });
        });
    }

    // calls the PING command and returns a promise to the expected PONG response
    ping() {
        return this.sendCommand('PING', 'ping');
    }

    quit() {
        return this.sendCommand('QUIT');
    }

    server() {
        return this.sendCommand('SERVER', 'stats');
    }

    // force the garbage collector
    gc() {
        return this.sendCommand('GC', 'ok');
    }

    configGet(prop) {
        return this.sendCommand('CONFIG GET', 'properties', prop);
    }

    // sets a configuration value in the database. Will return true if successful.
    // Note that the value does not get persisted until configRewrite is called.
    configSet(prop, value) {
        return this.sendCommand('CONFIG SET', 'ok', prop, value);
    }

    // persists changes made by configSet command. Will return true if successful
    configRewrite() {
        return this.sendCommand('CONFIG REWRITE', 'ok');
    }

    // flushes all data from the db. Will return true value if successful
    flushdb() {
        return this.sendCommand('FLUSHDB', 'ok');
    }

    // turns on or off readonly mode. (Pass true value to turn on)
    readOnly(val) {
        let v = val ? 'yes' : 'no'
        return this.sendCommand('READONLY', 'ok', v);
    }

    // Returns the minimum bounding rectangle for all objects in a key.
    bounds(key) {
        return this.sendCommand('BOUNDS', 'bounds', key);
    }

    // Set a timeout on an id.
    expire(key, id, seconds) {
        return this.sendCommand('EXPIRE', 'ok', key, id, seconds);
    }

    // Get a timeout on an id
    ttl(key, id) {
        return this.sendCommand('TTL', 'ttl', key, id);
    }

    persist(key, id) {
        return this.sendCommand('PERSIST', 'ok', key, id);
    }

    // Returns all keys matching pattern.
    keys(pattern) {
        return this.sendCommand('KEYS', 'keys', pattern);
    }


    /* obj can be one of the following:
     *   - an array with lat, lng and optional z coordinate, representing a point.
     *   - an array of 4 coordinates, representing a bounding box.
     *   - a string representing a Geohash
     *   - a GeoJson object.
     * fields should be a simple object with key value pairs
     * opts can be used to set additional options, such as:
     *   - expire: 3600          // to set expiration date of object
     *   - onlyIfExists: true    // only set field if key already exists
     *   - onlyIfNotExists: true // only set if id does not exist yet
     *   - type: 'string'        // to set string values (otherwise interpreted as geohash)
     * Examples:
     * set('fleet', 'truck1', [33.5123, -112.2693])
     * set('fleet', 'truck1', [33.5123, -112.2693, 120.0])
     * set('props', 'house1', [33.7840, -112.1520, 33.7848, -112.1512])
     * set('props', 'area1', '9tbnwg')   // assumes HASH by default if only one extra parameter
     * set('props', 'area2', 'my string value', {}, {'type':'string'}) # or force to String type
     * set('cities', 'tempe', geoJsonObject)
     *
     *
     */
    set(key, id, obj, fields = {}, opts = {}) {
        let cmd = [key, id];
        for (let f in fields) {
            cmd = cmd.concat(['FIELD', f, fields[f]]);
        }
        let expire = opts['expire'];
        if (expire > 0) {
            cmd.push('EX');
            cmd.push(expire);
        }
        if (opts['onlyIfNotExists']) {
            cmd.push('NX');
        }
        if (opts['onlyIfExists']) {
            cmd.push('XX');
        }
        if (Array.isArray(obj)) {
            if (obj.length < 4) {
                cmd.push('POINT');
                cmd = cmd.concat(obj);
            } else if (obj.length == 4) {
                cmd.push('BOUNDS');
                cmd = cmd.concat(obj);
            } else {
                throw Error("incorrect number of values");
            }
        } else if (typeof obj == 'string') {
            if (opts['type'] == 'string') {
                cmd.push('STRING');
                cmd.push(`"${obj}"`);
            } else {
                cmd.push('HASH');
                cmd.push(obj);
            }
        } else {
            // must be a Geojson object
            cmd.push(JSON.stringify(obj));
        }
        console.dir(cmd);
        return this.sendCommand('SET', 'ok', ...cmd);
    }

    // Delete an id from a key
    del(key, id) {
        return this.sendCommand('DEL', 'ok', key, id);
    }

    //
    /*
     * Get the object of an id. The default output format is a GeoJSON object.
     * Ways to call this method:
     *   get('fleet', 'truck1')            // returns geojson point
     *   get('fleet', 'truck1', 'POINT')   // same as above
     *   get('fleet', 'truck1', 'BOUNDS')  // return bounds
     *   get('fleet', 'truck1', 'HASH', 6) // return geohash
     */
    get(key, id, type, precision) {
        let c;
        if (type && precision) {
            c = this.sendCommand('GET', 'hash', key, id, type, precision);
        } else if (type) {
            c = this.sendCommand('GET', type.toLowerCase(), key, id, type);
        } else {
            c = this.sendCommand('GET', 'object', key, id);
        }
        return c;
    }

    // shortcut for GET method with output POINT
    getPoint(key, id) {
        return this.get(key, id, 'POINT');
    }

    // shortcut for GET method with output BOUNDS
    getBounds(key, id) {
        return this.get(key, id, 'BOUNDS');
    }

    // shortcut for GET method with output HASH
    getHash(key, id, precision) {
        return this.get(key, id, 'HASH', precision);
    }


    // Remove all objects from specified key.
    drop(key) {
         return this.sendCommand('DROP', 'ok', key);
    }

    // Return stats for one or more keys.
    stats(...keys) {
         return this.sendCommand('STATS', 'stats', ...keys);
    }

}

module.exports = Tile38