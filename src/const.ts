import type { Resources } from "./types";

/** Number of turns before game ends */
export const MAX_TURNS = 100;

/** Protein gain from absorbing a protein source */
export const PROTEIN_SOURCE_GAIN = 3;

/** Protein gain from harvester per turn */
export const HARVESTER_PROTEIN_GAIN = 1;

/** Protein costs for different organ types */
export const ORGAN_COSTS = {
  BASIC: [1, 0, 0, 0] as Resources,
  HARVESTER: [0, 0, 1, 1] as Resources,
  TENTACLE: [0, 1, 1, 0] as Resources,
} as const;

/** Possible organ types as enum-like object */
export const ORGAN_TYPES = {
  WALL: "WALL",
  ROOT: "ROOT",
  BASIC: "BASIC",
  HARVESTER: "HARVESTER",
  TENTACLE: "TENTACLE",
} as const;

/** Array of all organ types */
export const ORGAN_TYPES_ARRAY = [
  "WALL",
  "ROOT",
  "BASIC",
  "HARVESTER",
  "TENTACLE",
] as const;

/** Array of all possible directions */
export const DIRECTIONS = ["E", "S", "W", "N"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const DIRECTION_VECTORS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
] as const;

/** Array of all protein types */
export const PROTEIN_TYPES = ["A", "B", "C", "D"] as const;
export type ProteinType = (typeof PROTEIN_TYPES)[number];
