import { Tile38Argument, Tile38Command } from ".";
import { Tile38Query } from "./query";

/**
 * Convert a query to a raw redis encoded command. 
 * 
 * @param query 
 */
export function queryToEncodedCommand(query: Tile38Query): string {
    return redisEncodeCommand(query.type, query.compileCommandArray());
}

/**
 * encodes the tile38_query.commandArr() output to be sent to Redis. This is only necessary for the live geofence,
 * since the sendCommand() function uses the node_redis library, which handles this for us.
 * 
 * @param command 
 * @param args 
 */
export function redisEncodeCommand(command: Tile38Command, args: Tile38Argument[]): string {
    // this is a greatly simplified version of the internal_send_command() functionality in
    // https://github.com/NodeRedis/node_redis/blob/master/index.js
    let cmdStr = "*" + (args.length + 1) + "\r\n$" + command.length + "\r\n" + command + "\r\n";
    let str;
    for (const c of args) {
        if (typeof c === "string")
            str = c;
        else
            str = c.toString();
        cmdStr += "$" + Buffer.byteLength(str) + "\r\n" + str + "\r\n";
    }
    return cmdStr;
}