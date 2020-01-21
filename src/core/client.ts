import { RedisClient } from "redis";

import { mergeConfig, Tile38Config } from "../config";
import { Tile38Command, Tile38Response } from "../types";

/**
 * Core Tile38 class to abstract common tasks from the configuration.
 */
export class CoreClient {

    protected config: Tile38Config;
    protected client: RedisClient;

    constructor(config?: Partial<Tile38Config>, client?: RedisClient) {
        this.config = mergeConfig(config);
        this.client = client || new RedisClient(this.config);

        // Configure the client
        this.client.on("error", this.onClientError);
    }


    /**
     * Send a command with optional arguments to the Redis driver, and return the response in a Promise.
     * If returnProp is set, it will assume that the response is a JSON string, then parse and return
     * the given property from that string.
     * 
     * @param command command
     * @param args optional command arguments
     */
    protected async execute<T>(command: Tile38Command, ...args: unknown[]): Promise<Tile38Response<T>> {
        const { logging } = this.config;
        return new Promise<Tile38Response<T>>((resolve, reject) => {
            logging.debug(`Executing command ${command} ${args.join(" ")}`);
            this.client.sendCommand(command, args, (error, rawResult: string) => {
                const result: Tile38Response<T> = JSON.parse(rawResult);
                if (error) {
                    if (this.config.debug) {
                        logging.warn(`Command ${command} failed: ${error.message}`)
                        logging.debug(error);
                    }
                    reject(error);
                }

                if (result.ok) {
                    logging.debug(`Elapsed ${result.elapsed}`);
                    resolve(result);
                } else {
                    if (result.err) {
                        reject(result.err);
                    } else {
                        reject(`Unexpected response: ${result}`);
                    }
                }
            });
        });
    }

    /**
     * Execute and return a single value from the return value
     * 
     * @param command 
     * @param key 
     * @param args 
     */
    protected async executeForSingleField<T>(command: Tile38Command, key: keyof T, ...args: unknown[]): Promise<Tile38Response<T>[keyof T]> {
        return await this
            .execute<T>(command, args)
            .then((result) => this.getResultField(result, key));
    }

    /**
     * Execute and return the object without control values (ok, elapsed)
     * 
     * @param command 
     * @param args 
     */
    protected async executeForObject<T>(command: Tile38Command, ...args: unknown[]): Promise<T> {
        return await this
            .execute<T>(command, args)
            .then((result) => this.getResultObject(result));
    }

    /**
     * Execute and return the value of the OK field, which is a boolean
     * 
     * @param command 
     * @param args 
     */
    protected async executeForOK(command: Tile38Command, ...args: unknown[]): Promise<boolean> {
        return await this.executeForSingleField(command, "ok", args);
    }

    /**
     * Get a single field from the result.
     * 
     * @param result 
     * @param key 
     */
    protected getResultField<T>(result: Tile38Response<T>, key: keyof T): Tile38Response<T>[keyof T] {
        return result[key];
    }

    /**
     * Get all result fields except the control fields ok and elapsed.
     * 
     * @param result 
     */
    protected getResultObject<T>(result: Tile38Response<T>): T {
        delete result.ok;
        delete result.elapsed;
        return result;
    }

    /**
     * Handle client errors
     * @param error connection error
     */
    protected onClientError(error: unknown) {
        this.config.logging.error(`Tile38 client error: ${error}`);
    }
}
