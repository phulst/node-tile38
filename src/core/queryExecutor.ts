import { RedisClient } from "redis";

import { Tile38Config } from "../config";
import { CoreClient } from "./client";
import { LiveGeofence } from "./live";
import { Tile38Query } from "./query";
import { queryToEncodedCommand } from "./util";

/**
 * Wrapper class to execute queries
 */
export class QueryExecutor extends CoreClient {
    constructor(public query: Tile38Query, config: Tile38Config, client: RedisClient) {
        super(config, client);
    }

    /**
     * Execute the query
     */
    public async execute<T>(): Promise<T> {
        return await this.executeForObject<T>(
            this.query.type, this.query.compileCommandArray());
    }

    /**
     * Returns streaming results for a live geofence. This function will repeatedly call the specified callback
     * method when results are received.
     * This method returns an instance of LiveGeofence, which can be used to close the fence if necessary by calling
     * its close() method.
     * 
     * @param callback to process the results
     * @returns LiveGeofence
     */
    public executeFence<T>(callback: (result: T | string | undefined) => void): LiveGeofence {
        this.query.withFence();
        return new LiveGeofence(this.config)
            .open(queryToEncodedCommand(this.query), callback);
    }
}
