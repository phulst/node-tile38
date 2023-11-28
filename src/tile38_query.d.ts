/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/prevent-abbreviations */

import Tile38 from "./tile38";

declare class Tile38Query {
  constructor(type: string, key: string, client: Tile38);

  cursor(start: number): Tile38Query;
  limit(count: number): Tile38Query;
  sparse(spread: number): Tile38Query;
  match(value: string): Tile38Query;
  order(value: "asc" | "desc"): Tile38Query;
  asc(): Tile38Query;
  desc(): Tile38Query;
  distance(): Tile38Query;
  where(
    field: string,
    min: number | string,
    max?: number | string
  ): Tile38Query;
  whereIn(field: string, ...values: Array<number | string>): Tile38Query;
  whereEval(script: string, ...args: any[]): Tile38Query;
  whereEvalSha(sha: string, ...args: any[]): Tile38Query;
  clip(): Tile38Query;
  nofields(): Tile38Query;
  detect(...values: string[]): Tile38Query;
  commands(...values: string[]): Tile38Query;
  output(
    type: "bounds" | "count" | "hashes" | "ids" | "objects" | "points",
    precision?: number
  ): Tile38Query;
  ids(): Tile38Query;
  count(): Tile38Query;
  objects(): Tile38Query;
  points(): Tile38Query;
  hashes(precision: number): Tile38Query;
  nodwell(): Tile38Query;
  timeout(secs: number): Tile38Query;
  getObject(key: string, id: string): Tile38Query;
  bounds(
    minlat: number,
    minlon: number,
    maxlat: number,
    maxlon: number
  ): Tile38Query;
  object(geojson: object): Tile38Query;
  tile(x: number, y: number, z: number): Tile38Query;
  quadKey(key: string): Tile38Query;
  hash(geohash: string): Tile38Query;
  circle(lat: number, lon: number, meters: number): Tile38Query;
  point(lat: number, lon: number, meters?: number): Tile38Query;
  roam(key: string, pattern: string, meters: number): Tile38Query;
  commandStr(): string;
  commandArr(): string[];
  execute(): Promise<any>;
  executeFence(callback: (data: any) => void): any;

  static intersects(key: string): Tile38Query;
  static search(key: string): Tile38Query;
  static nearby(key: string): Tile38Query;
  static scan(key: string): Tile38Query;
  static within(key: string): Tile38Query;
}

export = Tile38Query;
