import { Tile38Id, Tile38Key } from ".";

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
    [key: string]: unknown | [];
};

export type Tile38DetectEvents = "inside" | "outside" | "enter" | "exit" | "cross";
