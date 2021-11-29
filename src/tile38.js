// const Redis = require('ioredis');
const redis = require('redis');
const Query = require('./tile38_query');
const LiveGeofence = require('./live_geofence');

const DEFAULT_HASH_PRECISION = 6;

class Tile38 {

    constructor({port, host, password, debug = false, logger = console} = {}) {
        this.port = port ? port : (process.env.TILE38_PORT || 9851);
        this.host = host ? host : (process.env.TILE38_HOST || 'localhost');
        this.password = password ? password : process.env.TILE38_PASSWD;
        this.logger = logger;

        let conn = { port: this.port, host: this.host};
        if (this.password) {
            conn.password = this.password;
        }
        this.client = redis.createClient(conn);
        this.client.on('error', (err) => {
            this.logger.error('Tile38 connection error: ' + err);
        });
        // put the OUTPUT in json mode, whenever connection is (re)established
        this.sendCommand('OUTPUT', null, 'json');
        // after a reconnect, ensure that the OUTPUT mode is still json
        this.client.on('connect', () => {
          this.sendCommand('OUTPUT', null, 'json').catch((err) => {
            // unable to set output mode to json. Is the connection already closed?
            this.logger.warn(`unable to set output mode to json: ${err.message}`);
          });
        });
        this.debug = debug;
    }


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
    executeCommand(command, opts = {}) {
        let returnProp = opts.returnProp || 'ok';
        let parseJson = (opts.parseJson === undefined) ? true : opts.parseJson; // could be set as false
        let opt = parseJson ? returnProp : false;
        let commandArr = command.split(' ');
        return this.sendCommand(commandArr.shift(), opt, commandArr);
    }

    /*
     * send a command with optional arguments to the Redis driver, and return the response in a Promise.
     * If returnProp is set, it will assume that the response is a JSON string, then parse and return
     * the given property from that string.
     */
    sendCommand(cmd, returnProp, args) {
        // make args an array if it's not already one
        if (!args) {
            args = []
        } else if (!Array.isArray(args)) {
            args = [args];
        }
        return new Promise((resolve, reject) => {
            if (this.debug) {
                this.logger.log(`sending command "${cmd} ${args.join(' ')}"`);
            }
            this.client.send_command(cmd, args, (err, result) => {
                if (err) {
                    if (this.debug) this.logger.error(err);
                    reject(err);
                } else {
                    if (this.debug) this.logger.log(result);
                    try {
                        if (!returnProp) {
                            // return the raw response
                            resolve(result);
                        } else {
                            let res = JSON.parse(result);
                            if (!res.ok) {
                                if (res.err) {
                                    reject(new Error(res.err));
                                } else {
                                    reject(new Error(`unexpected response: ${result}`));
                                }
                            } else {
                                if (returnProp == 1) {
                                    // 1 has a special meaning. Return the entire response minus
                                    // 'ok' and 'elapsed' properties
                                    delete res.ok;
                                    delete res.elapsed;
                                    resolve(res);
                                } else {
                                    resolve(res[returnProp]);
                                }
                            }
                        }
                    } catch (error) {
                        reject(new Error(`response isn't valid JSON: ${result}`));
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
        return this.sendCommand('CONFIG SET', 'ok', [prop, value]);
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
        return this.sendCommand('READONLY', 'ok', (val ? 'yes' : 'no'));
    }

    // Returns the minimum bounding rectangle for all objects in a key.
    bounds(key) {
        return this.sendCommand('BOUNDS', 'bounds', key);
    }

    // Set a timeout on an id.
    expire(key, id, seconds) {
        return this.sendCommand('EXPIRE', 'ok', [key, id, seconds]);
    }

    // Get a timeout on an id
    ttl(key, id) {
        return this.sendCommand('TTL', 'ttl', [key, id]);
    }

    persist(key, id) {
        return this.sendCommand('PERSIST', 'ok', [key, id]);
    }

    rename(oldKey, newKey) {
        return this.sendCommand('RENAME', 'ok', [oldKey, newKey]);
    }

    renamenx(oldKey, newKey) {
        // note that the Tile38 documentation states that the response
        // should be 0, 1 or ERR. However, in testing I found
        // it returns the typical 'OK' json response.
        return this.sendCommand('RENAMENX', 'ok', [oldKey, newKey]);
    }

    // Returns all keys matching pattern.
    keys(pattern) {
        return this.sendCommand('KEYS', 'keys', pattern);
    }

    // authenticate with server
    auth(password) {
        return this.sendCommand('AUTH', 'ok', password)
    }

    /* obj can be one of the following:
     *   - an array with lat, lng and optional z coordinate, representing a point.
     *   - an array of 4 coordinates, representing a bounding box.
     *   - a string representing a Geohash
     *   - a GeoJson object.
     * fields should be a simple object with key value pairs
     * opts can be used to set additional options, such as:
     *   - expire: 3600          // to set expiration date of object
     *   - onlyIfExists: true    // only set object if the id already exists
     *   - onlyIfNotExists: true // only set object if id does not exist yet
     *   - type: 'string'        // to set string values (otherwise interpreted as geohash)
     * Examples:
     *
     * // set a simple lat/lng coordinate
     * set('fleet', 'truck1', [33.5123, -112.2693])
     * // set with additional fields
     * set('fleet', 'truck1', [33.5123, -112.2693], { field1: 10, field2: 20});
     * // set lat/lon/alt coordinates, and expire in 120 secs
     * set('fleet', 'truck1', [33.5123, -112.2693, 120.0], {}, {expire: 120})
     * // set bounds
     * set('props', 'house1', [33.7840, -112.1520, 33.7848, -112.1512])
     * // set an ID by geohash
     * set('props', 'area1', '9tbnwg')   // assumes HASH by default if only one extra parameter
     * // set a String value
     * set('props', 'area2', 'my string value', {}, {type: 'string'}) # or force to String type
     * // set with geoJson object
     * set('cities', 'tempe', geoJsonObject)
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
            // if obj is an array, it must be either POINT or BOUNDS
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
            // if obj is a string, it must be String or geohash
            if (opts['type'] == 'string') {
                cmd.push('STRING');
                cmd.push(obj);
            } else {
                cmd.push('HASH');
                cmd.push(obj);
            }
        } else {
            // must be a Geojson object
            cmd.push('OBJECT');
            cmd.push(JSON.stringify(obj));
        }
        return this.sendCommand('SET', 'ok', cmd);
    }

    // convenience method for set() with options.type = 'string'
    setString(key, id, obj, fields = {}, opts = {}) {
        opts.type = 'string';
        return this.set(key, id, obj, fields, opts);
    }


    /**
     * Set the value for a one or more fields. This can be called in one of two ways:
     *     fset('fleet', 'truck1', 'speed', 16)
     * or to set multiple values:
     *     fset('fleet', 'truck1', { speed: 16, driver: 1224 })
     */
    fset(key, id, field, value) {
        let params;
        if (typeof field == 'string') {
            params = [key, id, field, value];
        } else {
            // object passed in
            let set = new Set();
            set.add(key);
            set.add(id);
            for (let k in field) {
                set.add(k);
                set.add(field[k]);
            }
            params = Array.from(set);
        }
        return this.sendCommand('FSET', 'ok', params);
    }

    // Delete an id from a key
    del(key, id) {
        return this.sendCommand('DEL', 'ok', [key, id]);
    }

    // Removes objects that match a specified pattern.
    pdel(key, pattern) {
        return this.sendCommand('PDEL', 'ok', [key, pattern]);
    }

    //
    /*
     * Get the object of an id. The default output format is a GeoJSON object.
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
     */
    get(key, id, {withfields = false, type = null} = {}) {

        let params = [key, id];
        if (withfields) params.push('WITHFIELDS');
        // TODO: check if startswith HASH and remove separate 'precision' property
        // it could just be passed as 'HASH 6'
        if (type != null && type.startsWith('HASH')) {
            // geohash requested, add precision if set
            params.push('HASH');
            let s = type.split(' ');
            if (s.length > 1 && parseInt(s[1]) > 0)
                params.push(s[1]);
            else
                throw new Error('missing precision. Please set like this: "HASH 6"');
        } else if (type != null) {
            params.push(type)
        }
        return this.sendCommand('GET', 1, params);
    }

    // shortcut for GET method with output POINT
    getPoint(key, id, opts = {}) {
        opts.type = 'POINT';
        return this.get(key, id, opts);
    }

    // shortcut for GET method with output BOUNDS
    getBounds(key, id, opts = {}) {
        opts.type = 'BOUNDS';
        return this.get(key, id, opts);
    }

    // shortcut for GET method with output HASH
    getHash(key, id, opts = {}) {
        let precision = opts.precision || DEFAULT_HASH_PRECISION;
        opts.type = `HASH ${precision}`;
        return this.get(key, id, opts);
    }

    // Remove all objects from specified key.
    drop(key) {
        return this.sendCommand('DROP', 'ok', key);
    }

    // Return stats for one or more keys.
    stats(...keys) {
        return this.sendCommand('STATS', 'stats', keys);
    }

    // Set a value in a JSON document
    jset(key, id, jKey, jVal) {
        return this.sendCommand('JSET', 'ok', [key, id, jKey, jVal]);
    }

    // Get a value from a json document
    jget(key, id, ...other) {
        let params = [key, id]
        params = params.concat(other)
        return this.sendCommand('JGET', 'value', params);
    }

    // Delete a json value
    jdel(key, id, jKey) {
        return this.sendCommand('JDEL', 'ok', [key, id, jKey]);
    }

    // returns a Tile38Query object that can be used to further construct an INTERSECTS query
    intersectsQuery(key) {
        return new Query('INTERSECTS', key, this);
    }

    // returns a Tile38Query object that can be used to further construct an SEARCH query
    searchQuery(key) {
        return new Query('SEARCH', key, this);
    }

    // returns a Tile38Query object that can be used to further construct an NEARBY query
    nearbyQuery(key) {
        return new Query('NEARBY', key, this);
    }

    // returns a Tile38Query object that can be used to further construct an SCAN query
    scanQuery(key) {
        return new Query('SCAN', key, this);
    }

    // returns a Tile38Query object that can be used to further construct an WITHIN query
    withinQuery(key) {
        return new Query('WITHIN', key, this);
    }

    /*
     * name:       webhook name
     * endpoint:   endpoint url for http/grpc/redis etc
     * meta:       object with key/value pairs for meta data
     * searchType: nearby/within/intersects
     * key:        the key to monitor
     * opts:       object for additional options:
     *   command:    del/drop/set
     *   detect:     inside/outside/enter/exit/cross
     *   get:        [key, id]   - to fetch an existing object from given key collection
     *   bounds:     [minlat, minlon, maxlat, maxlon]  - bounds coordinates
     *   object:     geojson object
     *   tile:       [x,y,z] - tile coordinates
     *   quadkey:    quadkey coordinates
     *   hash:       geohash coordinate
     *   radius:     radius/distance to apply
     *
     * command and detect may both exist but only one of the following get/bounds/object/tile/quadkey/hash
     * may be specified at a time.
     *
     * TODO: This command should be rewritten to use the same chaining form that the search commands use.
     */
    setHook(name, endpoint, meta, searchType, key, opts) {
        let cmd = [name, endpoint];
        if (meta) {
            for (let m of Object.keys(meta)) {
                cmd.push('META');
                cmd.push(m);
                cmd.push(meta[m]);
            }
        }
        cmd.push(searchType.toUpperCase());
        cmd.push(key);
        cmd.push('FENCE');
        cmd = cmd.concat(processOpts(opts, ['detect', 'commands', 'get', 'point', 'bounds', 'object',
            'tile', 'quadkey', 'hash', 'radius', 'roam']));
        return this.sendCommand('SETHOOK', 'ok', cmd);
    }

    // Returns all hooks matching a given pattern (which defaults to '*')
    hooks(pattern = "*") {
        return this.sendCommand('HOOKS', 'hooks', pattern);
    }

    // Remove a specified hook
    delhook(name) {
        return this.sendCommand('DELHOOK', 'ok', name);
    }

    // Removes all hooks that match the specified pattern
    pdelhook(pattern) {
        return this.sendCommand('PDELHOOK', 'ok', pattern);
    }

    // opens a live geofence and returns an instance of LiveGeofence (that can be used to later on close it).
    openLiveFence(command, commandArr, callback) {
        if (this.debug) {
            this.logger.log(`sending live fence command "${command} ${commandArr.join(' ')}"`);
        }
        let cmd = this.redisEncodeCommand(command, commandArr);
        return (new LiveGeofence(this.debug, this.logger)).open(this.host, this.port, this.password, cmd, callback);
    }

    // encodes the tile38_query.commandArr() output to be sent to Redis. This is only necessary for the live geofence,
    // since the sendCommand() function uses the node_redis library, which handles this for us.
    redisEncodeCommand(command, arr) {
        // this is a greatly simplified version of the internal_send_command() functionality in
        // https://github.com/NodeRedis/node_redis/blob/master/index.js
        let cmdStr = '*' + (arr.length + 1) + '\r\n$' + command.length + '\r\n' + command + '\r\n';
        let str;
        for (let c of arr) {
            if (typeof c === 'string')
                str = c;
            else
                str = c.toString();
            cmdStr += '$' + Buffer.byteLength(str) + '\r\n' + str + '\r\n';
        }
        return cmdStr;
    }
}

// processes all options that may be used by any of the search commands
let processOpts = function (opts, names) {
    let cmd = [];
    if (opts === undefined)
        return cmd; // no options

    for (let name of names) {
        if (!opts[name])
            continue; // an option with this name was not passed in.

        switch (name) {
            case 'cursor':
                cmd.push('CURSOR');
                cmd.push(opts.cursor);
                break;
            case 'limit':
                cmd.push('LIMIT');
                cmd.push(opts.limit);
                break;
            case 'sparse':
                cmd.push('SPARSE');
                cmd.push(opts.sparse);
                break;
            case 'match':
                cmd.push('MATCH');
                cmd.push(opts.match);
                break;
            case 'where':
                let w = opts.where;
                cmd.push('WHERE');
                for (let k in Object.keys(w)) {
                    cmd.push(k);
                    cmd.push(w[k][0]);
                    cmd.push(w[k][1]);
                }
                break;
            case 'nofields':
                if (opts.nofields == true)
                    cmd.push('NOFIELDS');
                break;
            case 'fence':
                if (opts.fence == true)
                    cmd.push('FENCE');
                break;
            case 'detect':
                cmd.push('DETECT');
                cmd.push(opts.detect);
                break;
            case 'commands':
                cmd.push('COMMANDS');
                cmd.push(opts.commands); // should be comma separated list
                break;
            case 'select': // COUNT, IDS, OBJECTS, POINTS, BOUNDS, HASHES
                cmd.push(ops.select.toUpperCase());
                break;
            case 'roam': // roam: [key, pattern, meters]
                cmd.push('ROAM');
                cmd = cmd.concat(opts.roam);
                break;
            case 'order':
                cmd.push(opts.order.toUpperCase());
                break;
        }
    }
    return cmd.concat(areaOpts(opts, names));
}

// processes all area options for within/intersects and sethook commands, then
// constructs an array with commands.
let areaOpts = function(opts, names) {
    let cmd = [];
    // iterate over all keys in the opts object and process any known options
    for (let name of names) {
        if (!opts[name])
            continue; // an option with this name was not passed in.

        switch(name) {
            case 'point': // point: [lat, lon, meters]
                cmd.push('POINT');
                cmd = cmd.concat(opts.point);
                break;
            case 'get': // passed like this:  'get: [key,id]'
                cmd.push('GET');
                cmd.push(opts.get[0]);
                cmd.push(opts.get[1]);
                break;
            case 'bounds':  // bounds: [minlat, minlon, maxlat, maxlon]
                cmd.push('BOUNDS');
                cmd.push(opts.bounds[0]);
                cmd.push(opts.bounds[1]);
                cmd.push(opts.bounds[2]);
                cmd.push(opts.bounds[3]);
                break;
            case 'object': // geojson object
                cmd.push('OBJECT');
                cmd.push(JSON.stringify(opts.object));
                break;
            case 'tile':
                cmd.push('TILE');
                cmd.push(opts.tile[0]);
                cmd.push(opts.tile[1]);
                cmd.push(opts.tile[2]);
                break;
            case 'quadkey':
                cmd.push('QUADKEY');
                cmd.push(opts.quadkey);
                break;
            case 'hash':
                cmd.push('HASH');
                cmd.push(opts.hash);
                break;
            case 'radius':
                // radius, used ie with POINT or geohash
                cmd.push(opts.radius);
                break;
        }
    }
    return cmd;
}


module.exports = Tile38;
