import type { Entity, GameState } from "./types";

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

function parseEntity(): Entity {
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
  } as Entity;
}

function parseResources() {
  const [a, b, c, d] = readline().split(" ").map(Number.parseInt);
  return { A: a, B: b, C: c, D: d };
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