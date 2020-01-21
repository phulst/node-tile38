import { Tile38Key } from "../core";

export type BaseTile38Response = {
    ok: boolean;
    elapsed: number;
    err: string | unknown;
}

export type Tile38Response<T> = BaseTile38Response & T;

export type AnyRedisResponse = Tile38Response<unknown>;

/**
 * More information: https://tile38.com/commands/server/
 */
export type Tile38Stats = {
    aof_size: number;
    avg_item_size: number;
    caught_up: true;
    following: string;
    heap_size: number;
    id: string;
    in_memory_size: number;
    num_collections: number;
    num_objects: number;
    num_points: number;
    pointer_size: number;
    read_only: boolean;
};

export type Tile38Pong = "pong";

export type Tile38Hook = {
    name: string;
    key: Tile38Key;
    endpoints: string[];
    command: string[];
};
