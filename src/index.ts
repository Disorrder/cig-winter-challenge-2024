/**
 * Grow and multiply your organisms to end up larger than your opponent.
 **/

// Game initialization
const { width, height } = parseInitialInput();

// game loop
while (true) {
  const state = getGameState();
  const myOrgans = findMyOrgans(state);

  // Read required actions count
  const requiredActionsCount = Number(readline());

  // Process each organ
  for (let i = 0; i < requiredActionsCount; i++) {
    const action = getAction(myOrgans[i], state);
    console.log(action);
  }
}

/* PARSING */

function parseInitialInput(): { width: number; height: number } {
  const [width, height] = readline().split(" ").map(Number.parseInt);
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

/* STATE */

function getGameState(): GameState {
  const entityCount = Number(readline());
  const entities = Array.from({ length: entityCount }, parseEntity);

  const myResources = parseResources();
  const oppResources = parseResources();

  return {
    entities,
    myResources,
    oppResources,
  };
}

function findMyOrgans(state: GameState): Entity[] {
  return state.entities.filter((e) => e.owner === 1 && e.organId > 0);
}

function findResources(state: GameState): Entity[] {
  return state.entities.filter(
    (e) => e.type === "A" || e.type === "B" || e.type === "C" || e.type === "D"
  );
}

/* ACTIONS */

function getAction(organ: Entity, state: GameState): string {
  const resources = findResources(state);

  // If we're a BASIC organ, try to grow towards resources
  if (organ.type === "BASIC") {
    const nearestResource = resources.sort(
      (a, b) =>
        Math.abs(a.x - organ.x) +
        Math.abs(a.y - organ.y) -
        (Math.abs(b.x - organ.x) + Math.abs(b.y - organ.y))
    )[0];

    if (nearestResource) {
      // Determine growth direction
      if (
        Math.abs(nearestResource.x - organ.x) >
        Math.abs(nearestResource.y - organ.y)
      ) {
        return nearestResource.x > organ.x ? "GROW E" : "GROW W";
      }
      return nearestResource.y > organ.y ? "GROW S" : "GROW N";
    }
  }

  // If we have enough resources, create a BASIC organ
  if (organ.type === "ROOT" && state.myResources.A >= 30) {
    return "BIRTH BASIC";
  }

  return "WAIT";
}

/* TYPES, DON'T MOVE TO OTHER FILES */

type Direction = "N" | "E" | "S" | "W" | "X";
type EntityType =
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
type Owner = -1 | 0 | 1; // -1: neutral, 0: enemy, 1: mine

interface Entity {
  x: number;
  y: number;
  type: EntityType;
  owner: Owner;
  organId: number;
  organDir: Direction;
  organParentId: number;
  organRootId: number;
}

interface GameState {
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
}
