export type Direction = "N" | "E" | "S" | "W" | "X";
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

export interface Entity {
  x: number;
  y: number;
  type: EntityType;
  owner: EntityOwner;
  organId: number;
  organDir: Direction;
  organParentId: number;
  organRootId: number;
}

export interface GameState {
  entities: Entity[];
  myResources: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  oppResources: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  requiredActionsCount: number;
}
