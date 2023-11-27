declare module "tile38" {
  import Tile38Query from "./tile38_query";

  type Fields = Record<string, number | string>;
  type GeoJSON = {
    type:
      | "Feature"
      | "FeatureCollection"
      | "Point"
      | "MultiPoint"
      | "LineString"
      | "MultiLineString"
      | "Polygon"
      | "MultiPolygon"
      | "GeometryCollection";
    properties?: Record<string, any>;
    geometry?: {
      type:
        | "Point"
        | "MultiPoint"
        | "LineString"
        | "MultiLineString"
        | "Polygon"
        | "MultiPolygon"
        | "GeometryCollection";
      coordinates: number[] | number[][] | number[][][];
    };
    features?: GeoJSON[];
  };
  type Bounds = [number, number, number, number];
  type Point = [number, number] | [number, number, number];
  type Hash = string;
  type Tile = [number, number, number];
  type QuadKey = string;
  type GeofenceOptions = {
    detect: string;
    commands: string;
    get?: [string, string];
    bounds?: Bounds;
    object?: GeoJSON;
    tile?: Tile;
    quadkey?: QuadKey;
    hash?: Hash;
    radius?: number;
  };

  type Tile38Response = {
    ok: boolean;
    elapsed: string;
    [key: string]: unknown;
  };

  type Tile38GETResponse<TObject = undefined> = {
    ok: boolean;
    elapsed: string;
  } & (
    | { object: TObject }
    | { bounds: Bounds }
    | { point: Point }
    | { hash: string }
  );

  type Tile38HookResponse = {
    ok: boolean;
    hooks: Array<{
      name: string;
      endpoint: string;
      meta: Record<string, unknown>;
      command: string;
      key: string;
      pattern: string;
    }>;
  };

  type Tile38KeysResponse = {
    ok: boolean;
    keys: string[];
  };

  type Tile38StatsResponse = {
    ok: boolean;
    stats: Array<Record<string, unknown>>;
  };

  type Tile38BoundsResponse = {
    ok: boolean;
    bounds: Bounds | GeoJSON;
  };

  type Tile38TTLResponse = {
    ok: boolean;
    ttl: number;
  };

  class Tile38 {
    constructor(options?: Tile38ConstructorOptions);
    set(
      key: string,
      id: string,
      obj: Point | Bounds | Hash | GeoJSON | string,
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
        type?: "POINT" | "BOUNDS" | "HASH" | "OBJECT";
      }
    ): Promise<Tile38GETResponse>;
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
      searchType: "NEARBY" | "WITHIN" | "INTERSECTS",
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
      field: string | Fields,
      value?: number | string
    ): Promise<Tile38Response>;
    drop(key: string): Promise<Tile38Response>;
    stats(...keys: string[]): Promise<Tile38StatsResponse>;
    jset<T = unknown>(
      key: string,
      id: string,
      jKey: string,
      jVal: T
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
