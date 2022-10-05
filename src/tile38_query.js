
// adds elements from arr2 to arr1. If arr1 doesn't exist, it will
// simply return arr2
function addToArray(arr1, arr2) {
  if (arr1) {
    for (let a of arr2) {
      arr1.push(a);
    }
    return arr1;
  } else {
    return arr2;
  }
}

class Tile38Query {


    constructor(type, key, client) {
        this.type = type;
        this.key = key;
        this.client = client;
        this.options = {};
    }

    cursor(start) {
        this.options.cursor = ['CURSOR', start];
        return this;
    }

    limit(count) {
        this.options.limit = ['LIMIT', count];
        return this;
    }

    sparse(spread) {
        this.options.sparse = ['SPARSE', spread];
        return this;
    }

    /*
     * set a matching query on the object ID. The value is a glob pattern.
     * Unlike other query methods in this class, match() may be called multiple times
     */
    match(value) {
        let m = ['MATCH', value];
        this.options.matches = addToArray(this.options.matches, m);
        return this;
    }

    // sort order for SCAN query, must be 'asc' or 'desc'
    order(val) {
        this.options.order = val.toUpperCase();
        return this;
    }

    // equivalent of order('asc')
    asc() {
        return this.order('asc');
    }
    // equivalent of order('desc');
    desc() {
        return this.order('desc');
    }

    // adds DISTANCE argument for nearby query.
    distance() {
        this.options.distance = 'DISTANCE';
        return this;
    }

    /*
     * set a where search pattern. Like match, this method may be chained multiple times
     * as well. For example:
     * query.where('speed', 70, '+inf').where('age', '-inf', 24)
     */
    where(field, ...criteria) {
        let arr = ['WHERE', field].concat(criteria);
        this.options.where = addToArray(this.options.where, arr);
        return this;
    }

    /*
     * set a wherein search pattern. Like match, this method may be chained multiple times
     * as well. For example:
     *   query.wherein('doors', 2, 5).wherein('wheels', 14, 18, 22)
     * Would generate the command:
     *   WHEREIN doors 2 2 5 WHEREIN wheels 3 14 18 22
     * (note that the command to the server includes the argument count, while the
     * js api doesn't need this)
     */
    whereIn(field, ...values) {
        let arr = ['WHEREIN', field, values.length].concat(values);
        this.options.whereIn = addToArray(this.options.whereIn, arr);
        return this;
    }
    whereEval(script, ...args) {
        let arr = ['WHEREEVAL', script, args.length].concat(args);
        this.options.whereEval = addToArray(this.options.whereEval, arr);
        return this;
    }
    whereEvalSha(sha, ...args) {
        let arr = ['WHEREEVALSHA', sha, args.length].concat(args);
        this.options.whereEvalSha = addToArray(this.options.whereEvalSha, arr);
        return this;
    }

    /*
     * clip intersecting objects
     */
    clip() {
        this.options.clip = 'CLIP';
        return this;
    }

    /*
     * call nofields to exclude field values from search results
     */
    nofields() {
        this.options.nofields = 'NOFIELDS';
        return this;
    }

    /*
     * sets one or more detect values. For example:
     * query.detect('inside', 'outside');
     *   or
     * query.detect('inside,outside');
     *
     * whichever you prefer
     */
    detect(...values) {
        this.options.detect = ['DETECT'].concat(values.join(','));
        return this;
    }

    /**
     * sets commands to listen for. Expected values: del, drop and set
     * You may pass these as separate parameters,
     *   query.commands('del', 'drop', 'set');
     *
     * or as a single comma separated parameter
     *   query.commands('del,drop,set');
     */
    commands(...values) {
        this.options.commands = ['COMMANDS'].concat(values.join(','));
        return this;
    }

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
    output(type, precision) {
        type = type.toUpperCase();
        if (type == 'HASHES' && precision != undefined) {
            this.options.output = [type, precision];
        } else {
            this.options.output = [type];
        }
        return this;
    }

    // shortcut for .output('ids')
    ids() {
        return this.output('ids');
    }
    // shortcut for .output('count')
    count() {
        return this.output('count');
    }
    // shortcut for .output('objects')
    objects() {
        return this.output('objects');
    }
    // shortcut for .output('points')
    points() {
        return this.output('points');
    }
    // shortcut for .output('points')
    hashes(precision) {
        return this.output('hashes', precision);
    }
    nodwell() {
      return this.output('nodwell');
    }

    // add a timeout to a query
    timeout(secs) {
      this.options.timeout = ['TIMEOUT', secs];
      return this;
    }

    /**
     * conducts search with an object that's already in the database
     */
    getObject(key, id) {
        this.options.getObject = ['GET', key, id];
        return this;
    }

    /**
     * conducts search with bounds coordinates
     */
    bounds(minlat, minlon, maxlat, maxlon) {
        this.options.bounds = ['BOUNDS', minlat, minlon, maxlat, maxlon];
        return this;
    }

    /**
     * conducts search with geojson object
     */
    object(geojson) {
        this.options.geojson = ['OBJECT', JSON.stringify(geojson)];
        return this;
    }

    tile(x, y, z) {
        this.options.tile = ['TILE', x, y, z];
        return this;
    }

    quadKey(key) {
        this.options.quadKey = ['QUADKEY', key];
        return this;
    }

    hash(geohash) {
        this.options.hash = ['HASH', geohash];
        return this;
    }

    // adds CIRCLE arguments to WITHIN / INTERSECTS queries
    circle(lat, lon, meters) {
        this.options.circle = ['CIRCLE', lat, lon, meters];
        return this;
    }

    // adds POINT arguments to NEARBY query.
    point(lat, lon, meters) {
        this.options.point = ['POINT', lat, lon];
        if (meters !== undefined) {
          this.options.point.push(meters);
        }
        return this;
    }

    // adds ROAM arguments to NEARBY query
    roam(key, pattern, meters) {
        // TODO throw error if type != 'NEARBY'
        this.options.roam = ['ROAM', key, pattern, meters];
        return this;
    }

    // return all the commands of the query chain, as a string, the way it will
    // be sent to Tile38
    commandStr() {
        // if set, TIMEOUT goes before anything else in the command string
        let t = this.options.timeout;
        let commandStr = t ? `${t[0]} ${t[1]} ` : '';

        return `${commandStr}${this.type} ${this.commandArr().join(' ')}`;
    }

    // constructs the full array for all arguments of the query.
    commandArr() {
        let cmd = [this.key];
        let o = this.options;

        // construct an array of commands in this order
        let commands = ['cursor', 'limit', 'sparse', 'matches', 'order', 'distance', 'where',
          'whereIn', 'whereEval', 'whereEvalSha', 'clip', 'nofields', 'fence', 'detect',
          'commands', 'output', 'getObject', 'bounds', 'geojson', 'tile', 'quadKey', 'hash',
          'point', 'circle', 'nodwell', 'roam' ];
        for (let c of commands) {
          let opt = o[c];
          if (opt !== undefined) {
            if (opt instanceof Array) {
              // array of objects
              for (let i of o[c]) {
                cmd.push(i);
              }
            } else {
              // simple string
              cmd.push(opt);
            }
          }
        }
        return cmd;
    }

    /**
     * will execute the query and return a Promise to the result.
     * To use the live fence with streaming results, use fence() instead.
     */
    execute() {
        return this.client.sendCommand(this.type, 1, this.commandArr());
    }

    /**
     * returns streaming results for a live geofence. This function will repeatedly call the specified callback
     * method when results are received.
     * This method returns an instance of LiveGeofence, which can be used to close the fence if necessary by calling
     * its close() method.
     */
    executeFence(callback) {
        this.options.fence = 'FENCE';
        return this.client.openLiveFence(this.type, this.commandArr(), callback);
    }

    /*
     * factory method to create a new Tile38Query object for an INTERSECTS search.
     * These factory methods are used in the test suite, but since these don't have
     * access to a Tile38 client object, they cannot be used to actually execute
     * a query on the server.
     * Use the Tile38.intersectsQuery() method instead.
     */
    static intersects(key) {
        return new Tile38Query('INTERSECTS', key);
    }

    // Use Tile38.searchQuery() method instead
    static search(key) {
        return new Tile38Query('SEARCH', key);
    }

    // Use Tile38.nearbyQuery() method instead
    static nearby(key) {
        return new Tile38Query('NEARBY', key);
    }

    // Use Tile38.scanQuery() method instead
    static scan(key) {
        return new Tile38Query('SCAN', key);
    }

    // Use Tile38.withinQuery() method instead
    static within(key) {
        return new Tile38Query('WITHIN', key);
    }
}

module.exports = Tile38Query;
