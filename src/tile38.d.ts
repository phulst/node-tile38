/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

declare module "tile38" {
  import Tile38Query from "./tile38_query";

  type Fields = Record<string, number | string>;
  interface GeoJSON {
    coordinates: number[] | number[][] | number[][][];
    features?: GeoJSON[];
    geometry?: {
      type:
        | "GeometryCollection"
        | "LineString"
        | "MultiLineString"
        | "MultiPoint"
        | "MultiPolygon"
        | "Point"
        | "Polygon";
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties?: Record<string, any>;
    type:
      | "Feature"
      | "FeatureCollection"
      | "GeometryCollection"
      | "LineString"
      | "MultiLineString"
      | "MultiPoint"
      | "MultiPolygon"
      | "Point"
      | "Polygon";
  }
  type Bounds = [number, number, number, number];
  type Point = [number, number, number] | [number, number];
  type Hash = string;
  type Tile = [number, number, number];
  type QuadKey = string;
  interface GeofenceOptions {
    bounds?: Bounds;
    commands: string;
    detect: string;
    get?: [string, string];
    hash?: Hash;
    object?: GeoJSON;
    quadkey?: QuadKey;
    radius?: number;
    tile?: Tile;
  }

  interface Tile38Response {
    ok: boolean;
    elapsed: string;
    [key: string]: unknown;
  }

  type Tile38GetResponse<TObject = undefined> = {
    elapsed: string;
    ok: boolean;
  } & (
    | { bounds: Bounds }
    | { hash: string }
    | { object: TObject }
    | { point: Point }
  );

  interface Tile38HookResponse {
    hooks: Array<{
      command: string;
      endpoint: string;
      key: string;
      meta: Record<string, unknown>;
      name: string;
      pattern: string;
    }>;
    ok: boolean;
  }

  interface Tile38KeysResponse {
    keys: string[];
    ok: boolean;
  }

  interface Tile38StatsResponse {
    ok: boolean;
    stats: Array<Record<string, unknown>>;
  }

  interface Tile38BoundsResponse {
    bounds: Bounds | GeoJSON;
    ok: boolean;
  }

  interface Tile38TTLResponse {
    ok: boolean;
    ttl: number;
  }

  class Tile38 {
    constructor(options?: Tile38ConstructorOptions);
    set(
      id: string,
      key: string,
      // eslint-disable-next-line max-len
      // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
      obj: Bounds | GeoJSON | Hash | Point | string,
      fields?: Fields,
      opts?: {
        expire?: number;
        onlyIfExists?: boolean;
        onlyIfNotExists?: boolean;
        type?: "string";
      }
    ): Promise<Tile38Response>;
    get(
      key: string,
      id: string,
      opts?: {
        withfields?: boolean;
        type?: "BOUNDS" | "HASH" | "OBJECT" | "POINT";
      }
    ): Promise<Tile38GetResponse>;
    del(key: string, id: string): Promise<Tile38Response>;
    flushdb(): Promise<Tile38Response>;
    ping(): Promise<Tile38Response>;
    quit(): Promise<Tile38Response>;
    server(): Promise<Tile38Response>;
    gc(): Promise<Tile38Response>;
    configGet(prop: string): Promise<Tile38Response>;
    configSet(prop: string, value: unknown): Promise<Tile38Response>;
    configRewrite(): Promise<Tile38Response>;
    hooks(pattern?: string): Promise<Tile38HookResponse>;
    delhook(name: string): Promise<Tile38Response>;
    pdelhook(pattern: string): Promise<Tile38Response>;
    openLiveFence(
      command: string,
      commandArr: string[],
      callback: (data: unknown) => void
    ): Promise<unknown>;
    readOnly(val: boolean): Promise<Tile38Response>;
    bounds(key: string): Promise<Tile38BoundsResponse>;
    expire(key: string, id: string, seconds: number): Promise<Tile38Response>;
    ttl(key: string, id: string): Promise<Tile38TTLResponse>;
    persist(key: string, id: string): Promise<Tile38Response>;
    rename(oldKey: string, newKey: string): Promise<Tile38Response>;
    renamenx(oldKey: string, newKey: string): Promise<Tile38Response>;
    keys(pattern: string): Promise<Tile38KeysResponse>;
    auth(password: string): Promise<Tile38Response>;
    setHook(
      name: string,
      endpoint: string,
      meta: Record<string, unknown>,
      searchType: "INTERSECTS" | "NEARBY" | "WITHIN",
      key: string,
      opts: GeofenceOptions
    ): Promise<Tile38Response>;
    setString(
      key: string,
      id: string,
      obj: string,
      fields?: Fields,
      opts?: {
        expire?: number;
        onlyIfExists?: boolean;
        onlyIfNotExists?: boolean;
      }
    ): Promise<Tile38Response>;
    fset(
      key: string,
      id: string,
      field: Fields | string,
      value?: number | string
    ): Promise<Tile38Response>;
    drop(key: string): Promise<Tile38Response>;
    stats(...keys: string[]): Promise<Tile38StatsResponse>;
    jset<TValue = unknown>(
      key: string,
      id: string,
      jKey: string,
      jVal: TValue
    ): Promise<Tile38Response>;
    jget(key: string, id: string, ...other: string[]): Promise<string>;
    jdel(key: string, id: string, jKey: string): Promise<Tile38Response>;
    intersectsQuery(key: string): Tile38Query;
    searchQuery(key: string): Tile38Query;
    nearbyQuery(key: string): Tile38Query;
    scanQuery(key: string): Tile38Query;
    withinQuery(key: string): Tile38Query;
    executeCommand(command: string, opts?: object): Promise<Tile38Response>;
    sendCommand(
      cmd: string,
      returnProp: string | null,
      args?: unknown[]
    ): Promise<Tile38Response>;
  }

  interface Tile38ConstructorOptions {
    port?: number;
    host?: string;
    password?: string;
    debug?: boolean;
    logger?: Console;
  }

  export = Tile38;
}
