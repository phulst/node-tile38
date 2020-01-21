import { RedisClient } from "redis";

import { Tile38OptionType, Tile38Query } from ".";
import { Tile38Config } from "../config";
import { Tile38Key } from "../types/commands";
import { QueryExecutor } from "./queryExecutor";

/**
 * Use this class to create query executors.
 */
export class QueryFactory {

    /**
     * Create an instance of the QueryFactory. 
     * 
     * @param config 
     * @param client 
     */
    public constructor(private config: Tile38Config, private client: RedisClient) { }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an INTERSECTS search.
     * 
     * @param key saved key
     */
    public intersects(key: Tile38Key): QueryExecutor {
        return this.createExecutor("INTERSECTS", key);
    }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an SEARCH search.
     * 
     * @param key saved key
     */
    public search(key: Tile38Key): QueryExecutor {
        return this.createExecutor("SEARCH", key);
    }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an NEARBY search.
     * 
     * @param key saved key
     */
    public nearby(key: Tile38Key): QueryExecutor {
        return this.createExecutor("NEARBY", key);
    }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an SCAN search.
     * 
     * @param key saved key
     */
    public scan(key: Tile38Key): QueryExecutor {
        return this.createExecutor("SCAN", key);
    }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an WITHIN search.
     * 
     * @param key saved key
     */
    public within(key: Tile38Key): QueryExecutor {
        return this.createExecutor("WITHIN", key);
    }

    /**
     * Create a query executor for a given Tile38 query.
     * 
     * @param key saved key
     */
    public executor(query: Tile38Query): QueryExecutor {
        return new QueryExecutor(query, this.config, this.client);
    }

    private createExecutor(type: Tile38OptionType, key: Tile38Key): QueryExecutor {
        return this.executor(new Tile38Query(type, key));
    }
}
