

class Tile38Query {


    constructor(type, key, client) {
        this.type = type;
        this.key = key;
        this.client = client;
        this.options = {};
    }


    cursor(start) {
        this.options.cursor = start;
        return this;
    }

    limit(count) {
        this.options.limit = count;
        return this;
    }

    sparse(spread) {
        this.options.sparse = spread;
        return this;
    }

    /*
     * set a matching query on the object ID. The value is a glob pattern.
     * Unlike other query methods in this class, match() may be called multiple times
     */
    match(value) {
        if (this.options.matches == undefined) {
            this.options.matches = [];
        }
        this.options.matches.push(value);
        return this;
    }

    // sort order for SCAN query, must be 'asc' or 'desc'
    order(val) {
        // TODO throw error if type != 'SCAN'
        this.options.order = val;
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
        // TODO throw error if type != 'NEARBY'
        this.options.distance = true;
        return this;
    }

    /*
     * set a where search pattern. Like match, this method may be chained multiple times
     * as well. For example:
     * query.where('speed', 70, '+inf').where('age', '-inf', 24)
     */
    where(field, ...criteria) {
        if (this.options.where == undefined) {
            this.options.where = [];
        }
        let arr = [field].concat(criteria);
        this.options.where.push(arr);
        return this;
    }

    /*
     * call nofields to exclude field values from search results
     */
    nofields() {
        this.options.nofields = true;
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
        this.options.detect = values.join(',');
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
        this.options.commands = values.join(',');
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
     */
    output(type, precision) {
        type = type.toUpperCase();
        if (type == 'HASHES' && precision != undefined) {
            this.options.output = `${type} ${precision}`
        } else {
            this.options.output = type;
        }
        return this;
    }

    /**
     * conducts search with an object that's already in the database
     */
    getObject(key, id) {
        this.options.getObject = { key, id};
        return this;
    }

    /**
     * conducts search with bounds coordinates
     */
    bounds(minlat, minlon, maxlat, maxlon) {
        this.options.bounds = [minlat, minlon, maxlat, maxlon];
        return this;
    }

    /**
     * conducts search with geojson object
     */
    object(geojson) {
        this.options.geojson = geojson;
        return this;
    }

    tile(x, y, z) {
        this.options.tile = {x, y, z};
        return this;
    }

    quadKey(key) {
        this.options.quadKey = key;
        return this;
    }

    hash(geohash) {
        this.options.hash = geohash;
        return this;
    }

    // adds POINT arguments to NEARBY query
    point(lat, lon, meters) {
        // TODO throw error if type != 'NEARBY'
        this.options.point = {lat, lon, meters};
        return this;
    }

    // adds ROAM arguments to NEARBY query
    roam(key, pattern, meters) {
        // TODO throw error if type != 'NEARBY'
        this.options.roam = {key, pattern, meters};
        return this;
    }

    // return all the commands of the query chain, as a string, the way it will
    // be sent to Tile38
    commandStr() {
        return this.type + " " + this.commandArr().join(' ');
    }

    // constructs an array of all arguments of the query. This does not
    // include the query type itself.
    commandArr() {
        let cmd = [this.key];
        let o = this.options;
        if (o.cursor) {
            cmd.push('CURSOR');
            cmd.push(o.cursor);
        }
        if (o.limit) {
            cmd.push('LIMIT');
            cmd.push(o.limit);
        }
        if (o.sparse) {
            cmd.push('SPARSE');
            cmd.push(o.sparse);
        }
        if (o.matches) {
            // add one or more matches
            for (let k of o.matches) {
                cmd.push('MATCH');
                cmd.push(k);
            }
        }
        if (o.order) { // add ASC or DESC to SCAN query
            cmd.push(o.order.toUpperCase());
        }

        if (o.distance) {
            cmd.push('DISTANCE');
        }
        if (o.where) {
            // add one or more where clauses
            for (let k of o.where) {
                cmd.push('WHERE');
                for (let l of k) {
                    cmd.push(l);
                }
            }
        }
        if (o.nofields) {
            cmd.push('NOFIELDS');
        }
        if (o.fence) {
            cmd.push('FENCE');
        }
        if (o.detect) {
            cmd.push('DETECT');
            cmd.push(o.detect);
        }
        if (o.commands) {
            cmd.push('COMMANDS');
            cmd.push(o.commands);
        }
        if (o.output) {
            cmd.push(o.output);
        }
        if (o.getObject) {
            cmd.push('GET');
            cmd.push(o.getObject.key);
            cmd.push(o.getObject.id);
        }
        if (o.bounds) {
            cmd.push('BOUNDS');
            cmd = cmd.concat(o.bounds);
        }
        if (o.geojson) {
            cmd.push('OBJECT');
            cmd.push(JSON.stringify(o.geojson));
        }
        if (o.tile) {
            cmd.push('TILE');
            cmd.push(o.tile.x);
            cmd.push(o.tile.y);
            cmd.push(o.tile.z);
        }
        if (o.quadKey) {
            cmd.push('QUADKEY');
            cmd.push(o.quadKey);
        }
        if (o.hash) {
            cmd.push('HASH');
            cmd.push(o.hash);
        }
        if (o.point) {
            cmd.push('POINT');
            cmd.push(o.point.lat);
            cmd.push(o.point.lon);
            cmd.push(o.point.meters);
        }
        if (o.roam) {
            cmd.push('ROAM');
            cmd.push(o.roam.key);
            cmd.push(o.roam.pattern);
            cmd.push(o.roam.meters);
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
        this.options.fence = true;
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
