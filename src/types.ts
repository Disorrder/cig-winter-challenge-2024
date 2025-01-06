import type { Direction } from "./const";

export type EntityType =
  | "WALL"
  | "ROOT"
  | "BASIC"
  | "TENTACLE"
  | "HARVESTER"
  | "SPORER"
  | "A"
  | "B"
  | "C"
  | "D";
export type NeutralOwner = -1;
/** 0: enemy, 1: mine */
export type PlayerOwner = 0 | 1;
export type EntityOwner = NeutralOwner | PlayerOwner;

export interface EntityData {
  x: number;
  y: number;
  type: EntityType;
  owner: EntityOwner;
  organId: number;
  organDir: Direction;
  organParentId: number;
  organRootId: number;
}

export type Resources = [number, number, number, number];

export interface GameState {
  entities: EntityData[];
  myResources: Resources;
  oppResources: Resources;
  requiredActionsCount: number;
}
