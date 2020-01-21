declare module "redis-parser" {
    type ParserOptions = {
        returnError: (error: Error) => void,
        returnReply: (reply: string) => void,
        returnFatalError?: (error: Error) => void,
        returnBuffers?: boolean,
        stringNumbers?: boolean
    };

    export default class Parser {
        /**
         * Javascript Redis Parser constructor
         * @param {{returnError: Function, returnReply: Function, returnFatalError?: Function, returnBuffers: boolean, stringNumbers: boolean }} options
         * @constructor
         */
        constructor(options: ParserOptions);

        /**
         * Reset the parser values to the initial state
         *
         * @returns {undefined}
         */
        reset(): void;

        /**
         * Parse the redis buffer
         * @param {Buffer} buffer
         * @returns {undefined}
         */
        execute(buffer: Buffer): void;
    }
}
