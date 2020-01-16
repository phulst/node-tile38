import { Point, Polygon } from "geojson";

import { Tile38QueryType } from "./query";

export type Tile38Command =
    "AUTH" |
    "BOUNDS" |
    "CONFIG GET" |
    "CONFIG REWRITE" |
    "CONFIG SET" |
    "DEL" |
    "GET" |
    "EXPIRE" |
    "FLUSHDB" |
    "FSET" |
    "GC" |
    "KEYS" |
    "PDEL" |
    "PERSIST" |
    "PING" |
    "QUIT" |
    "READONLY" |
    "SERVER" |
    "TTL" |
    "SET" |
    "DROP" |
    "STATS" |
    "JSET" |
    "JGET" |
    "JDEL" |
    "INTERSECTS" |
    "SEARCH" |
    "NEARBY" |
    "SCAN" |
    "WITHIN" |
    "HOOKS" |
    "SETHOOK" |
    "DELHOOK" |
    "PDELHOOK" | Tile38QueryType
    ;

export type BaseTile38Response = {
    ok: boolean;
    elapsed: number;
    err: string | any;
}

export type Tile38Response<T> = BaseTile38Response & T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRedisResponse = Tile38Response<any>;

export type Tile38Key = string;

export type Tile38Id = string;

export type Tile38Coord = [number, number] | [number, number, number] | [number, number, number, number] | string | Point | Polygon;

export type Tile38HashType = "HASH 5" | "HASH 6" | "HASH 7" | "HASH 8" | "HASH 9" | "HASH 10" | "HASH 11" | "HASH 12";

export type Tile38SetOptions = {
    expire?: number;
    onlyIfExists?: boolean;
    onlyIfNotExists?: boolean;
    type?: "string";
}

export type Tile38GetOptions = {
    withFields?: boolean;
    type?: "POINT" | "BOUNDS" | Tile38HashType;
}
