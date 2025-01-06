import type { EntityData, GameState, Resources } from "./types";

export interface InitialInput {
  width: number;
  height: number;
}

export function parseInitialInput(): InitialInput {
  const [width, height] = readline()
    .split(" ")
    .map((v) => Number(v));
  return { width, height };
}

function parseEntity(): EntityData {
  const [x, y, type, owner, organId, organDir, organParentId, organRootId] =
    readline().split(" ");

  return {
    x: Number(x),
    y: Number(y),
    type,
    owner: Number(owner) as -1 | 0 | 1,
    organId: Number(organId),
    organDir,
    organParentId: Number(organParentId),
    organRootId: Number(organRootId),
  } as EntityData;
}

function parseResources(): Resources {
  return readline()
    .split(" ")
    .map((str) => Number(str) || 0) as Resources;
}

export function parseGameState(): GameState {
  const entityCount = Number(readline());
  const entities = Array.from({ length: entityCount }, parseEntity);

  const myResources = parseResources();
  const oppResources = parseResources();
  const requiredActionsCount = Number(readline());

  return {
    entities,
    myResources,
    oppResources,
    requiredActionsCount,
  };
}
