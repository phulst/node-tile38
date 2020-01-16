import { defaultLoggin, ITile38Logging } from "../util/logging";
import { DEFAULT_TILE38_HOST, DEFAULT_TILE38_PORT } from "./constants";

export type Tile38Config = {
    port: number;
    host: string;
    password?: string;
    debug?: boolean;
    logging: ITile38Logging;
}

/**
 * Merge a config with the default values
 * @param config 
 */
export function mergeConfig(config: Partial<Tile38Config> = {}): Tile38Config {
    return {
        // Get all properties
        ...config,

        // Set some defaults
        port: config.port || DEFAULT_TILE38_PORT,
        host: config.host || DEFAULT_TILE38_HOST,
        logging: config.logging || defaultLoggin(),

    }
}
