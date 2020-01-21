export type Tile38ConfigProperty = keyof Tile38ConfigProperties;

/**
 * Taken from, but undocumented (!).
 * https://github.com/tidwall/tile38/blob/c084aeedc2a745752e46ccfa48d39ce78ee1cc60/internal/server/config.go
 */
export type Tile38ConfigProperties = {
    "follow_host": string;
    "follow_port": string;
    "follow_id": string;
    "follow_pos": number;
    "server_id": string;
    "read_only": string;
    "requirepass": string;
    "leaderauth": string;
    "protected-mode": string;
    "maxmemory": string;
    "autogc": "0" | "1";
    "keepalive": "0" | "1";
}
