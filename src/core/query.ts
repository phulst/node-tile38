import { Tile38 } from "..";
import { Tile38Id, Tile38Key } from "./types";

export type Tile38QueryType = string;

export type Tile38OptionType = "FENCE" | "IDS" | "COUNT" | "OBJECTS" | "POINTS" | "ASC" | "DESC" | "CURSOR" | "LIMIT" | "SPARSE" | "MATCH" | "DISTANCE" | "WHERE" | "WHEREIN" | "WHEREEVAL" | "WHEREEVALSHA" | "CLIP" | "NOFIELDS" | "DETECT" | "COMMANDS" | "HASHES" | "GET" | "BOUNDS" | "OBJECT" | "TILE" | "QUADKEY" | "HASH" | "CIRCLE" | "POINT" | "ROAM" | "FENCE" | "INTERSECTS" | "SEARCH" | "NEARBY" | "SCAN" | "WITHIN";

export type Tile38Argument = (string | number);

export type Tile38OptionArgument = (Tile38Argument | Tile38OptionType);

export type Tile38QueryOptions = {
    bounds?: [Tile38OptionType & "BOUNDS", number, number, number, number] | [];
    circle?: [Tile38OptionType & "CIRCLE", number, number, number] | [];
    clip?: [Tile38OptionType & "CLIP"];
    commands?: [Tile38OptionType & "COMMANDS", ...string[]] | [];
    cursor?: [Tile38OptionType & "CURSOR", number] | [];
    detect?: [Tile38OptionType & "DETECT", ...string[]] | [];
    distance?: [Tile38OptionType & "DISTANCE"];
    fence?: [Tile38OptionType & "FENCE"] | [];
    geojson?: [Tile38OptionType & "OBJECT", string] | [];
    getObject?: [Tile38OptionType & "GET", Tile38Id, Tile38Key] | [];
    hash?: [Tile38OptionType & "HASH", string] | [];
    limit?: [Tile38OptionType & "LIMIT", number] | [];
    matches?: [Tile38OptionType & "MATCH", ...Tile38OptionArgument[]] | [];
    noFields?: [Tile38OptionType & "NOFIELDS"] | [];
    order?: [Tile38OptionType & ("ASC" | "DESC")] | [];
    output?: [Tile38OptionType & ("HASHES" | "IDS" | "COUNT" | "OBJECTS" | "POINTS"), number?] | [];
    point?: [Tile38OptionType & "POINT", number, number] | [];
    quadKey?: [Tile38OptionType & "QUADKEY", Tile38Argument] | [];
    roam?: [Tile38OptionType & "ROAM", Tile38Key, string, number] | [];
    sparse?: [Tile38OptionType & "SPARSE", number] | [];
    tile?: [Tile38OptionType & "TILE", number, number, number] | [];
    where?: [Tile38OptionType & "WHERE", ...Tile38OptionArgument[]] | [];
    whereEval?: [Tile38OptionType & "WHEREEVAL", string, number, ...Tile38OptionArgument[]] | [];
    whereEvalSha?: [Tile38OptionType & "WHEREEVALSHA", string, number, ...Tile38OptionArgument[]] | [];
    whereIn?: [Tile38OptionType & "WHEREIN", string, number, ...Tile38OptionArgument[]] | [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any | [];
};

export type Tile38DetectEvents = "inside" | "outside" | "enter" | "exit" | "cross";

export class Tile38Query {

    public constructor(
        public type: Tile38OptionType,
        private key: Tile38Key,
        private options: Tile38QueryOptions = {}) { }


    withCursor(start: number) {
        this.options.cursor = ["CURSOR", start];
        return this;
    }

    withLimit(count: number) {
        this.options.limit = ["LIMIT", count];
        return this;
    }

    withSparse(spread: number) {
        this.options.sparse = ["SPARSE", spread];
        return this;
    }

    /*
     * set a matching query on the object ID. The value is a glob pattern.
     * Unlike other query methods in this class, match() may be called multiple times
     */
    withMatch(value: number | string) {
        this.options.matches = ["MATCH", value, ...(this.options.matches || [])];
        return this;
    }

    // sort order for SCAN query, must be 'asc' or 'desc'
    order(direction: Tile38OptionType & ("ASC" | "DESC")) {
        this.options.order = [direction];
        return this;
    }

    // equivalent of order('asc')
    withOrderAscending() {
        return this.order("ASC");
    }
    // equivalent of order('desc');
    withOrderDescending() {
        return this.order("DESC");
    }

    // adds DISTANCE argument for nearby query.
    withDistance() {
        this.options.distance = ["DISTANCE"];
        return this;
    }

    withFence() {
        this.options.fence = ["FENCE"];
        return this;
    }

    /*
     * set a where search pattern. Like match, this method may be chained multiple times
     * as well. For example:
     * query.where('speed', 70, '+inf').where('age', '-inf', 24)
     */
    withWhere(field: string, ...criteria: Tile38Argument[]) {
        const previous = this.options.where || [];
        this.options.where = ["WHERE", field, ...criteria];
        this.options.where.push(...previous);
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
    withWhereIn(field: string, ...values: Tile38Argument[]) {
        const previous = this.options.whereIn || [];
        this.options.whereIn = ["WHEREIN", field, values.length, ...values];
        this.options.whereIn.push(...previous);
        return this;
    }

    withWhereEval(script: string, ...args: Tile38Argument[]) {
        const previous = this.options.whereEval || [];
        this.options.whereEval = ["WHEREEVAL", `"${script}"`, args.length, ...args];
        this.options.whereEval.push(...previous);
        return this;
    }

    withWhereEvalSha(sha: string, ...args: Tile38Argument[]) {
        const previous = this.options.whereEvalSha || [];
        this.options.whereEvalSha = ["WHEREEVALSHA", sha, args.length, ...args];
        this.options.whereEvalSha.push(...previous);
        return this;
    }

    /*
     * clip intersecting objects
     */
    withClip() {
        this.options.clip = ["CLIP"];
        return this;
    }

    /*
     * call nofields to exclude field values from search results
     */
    withNoFields() {
        this.options.noFields = ["NOFIELDS"];
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
    withDetect(...values: Tile38DetectEvents[]) {
        this.options.detect = ["DETECT", values.join(",")];
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
    withCommands(...values: string[]) {
        this.options.commands = ["COMMANDS", values.join(",")];
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
    withOutput(type: Tile38OptionType & ("IDS" | "COUNT" | "OBJECTS" | "POINTS" | "HASHES"), precision?: number) {
        if (type == "HASHES" && precision && precision > 0) {
            this.options.output = [type, precision];
        } else {
            this.options.output = [type];
        }
        return this;
    }

    // shortcut for .output('ids')
    withIds() {
        return this.withOutput("IDS");
    }
    // shortcut for .output('count')
    withCount() {
        return this.withOutput("COUNT");
    }
    // shortcut for .output('objects')
    withObjects() {
        return this.withOutput("OBJECTS");
    }
    // shortcut for .output('points')
    withPoints() {
        return this.withOutput("POINTS");
    }
    // shortcut for .output('points')
    withHashes(precision: number) {
        return this.withOutput("HASHES", precision);
    }

    /**
     * conducts search with an object that's already in the database
     */
    withGetObject(key: Tile38Key, id: Tile38Id) {
        this.options.getObject = ["GET", key, id];
        return this;
    }

    /**
     * conducts search with bounds coordinates
     */
    withBounds(minlat: number, minlon: number, maxlat: number, maxlon: number) {
        this.options.bounds = ["BOUNDS", minlat, minlon, maxlat, maxlon];
        return this;
    }

    /**
     * conducts search with geojson object
     */
    withObject(geojson: GeoJSON.GeoJsonObject) {
        this.options.geojson = ["OBJECT", JSON.stringify(geojson)];
        return this;
    }

    withTile(x: number, y: number, z: number) {
        this.options.tile = ["TILE", x, y, z];
        return this;
    }

    withQuadKey(key: Tile38Key | Tile38Argument) {
        this.options.quadKey = ["QUADKEY", key];
        return this;
    }

    withHash(geohash: string) {
        this.options.hash = ["HASH", geohash];
        return this;
    }

    // adds CIRCLE arguments to WITHIN / INTERSECTS queries
    withCircle(lat: number, lon: number, radius: number) {
        this.options.circle = ["CIRCLE", lat, lon, radius];
        return this;
    }

    // adds POINT arguments to NEARBY query.
    withPoint(lat: number, lon: number, meters?: number) {
        this.options.point = ["POINT", lat, lon];
        if (meters) {
            this.options.point.push(meters);
        }
        return this;
    }

    // adds ROAM arguments to NEARBY query
    withRoam(key: Tile38Key, pattern: string, meters: number) {
        // TODO throw error if type != 'NEARBY'
        this.options.roam = ["ROAM", key, pattern, meters];
        return this;
    }

    // return all the commands of the query chain, as a string, the way it will
    // be sent to Tile38
    public compileCommand(): string {
        return this.type + " " + this.compileCommandArray().join(" ");
    }

    // constructs the full array for all arguments of the query.
    public compileCommandArray(): string[] {
        return this.commandOrder()
            .map((optionKey) => this.options[optionKey])
            .reduce((prev, current) => {
                if (current instanceof Array) {
                    prev.push(...current);
                }
            }, [this.key]);
    }

    public commandOrder(): (keyof Tile38QueryOptions)[] {
        return ["cursor", "limit", "sparse", "matches", "order", "distance", "where",
            "whereIn", "whereEval", "whereEvalSha", "clip", "nofields", "fence", "detect",
            "commands", "output", "getObject", "bounds", "geojson", "tile", "quadKey", "hash",
            "point", "circle", "roam"];
    }
}
