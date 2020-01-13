/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ITile38Logging {
    debug: (msg: any) => void;
    error: (msg: any) => void;
    log: (msg: any) => void;
    warn: (msg: any) => void;
}

export function defaultLoggin(): ITile38Logging {
    return console;
}
