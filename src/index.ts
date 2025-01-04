import { Clock } from "./Clock";
import { ORGAN_COSTS, ORGAN_TYPES } from "./const";
import { GameMap } from "./map";
import { parseGameState, parseInitialInput } from "./parser";
import type { GameState, Resources } from "./types";

const clock = new Clock("main");

// Game initialization
const { width, height } = parseInitialInput();
const gameMap = new GameMap(width, height);

// game loop
while (true) {
  clock.stop("frame end");
  clock.start();

  const state = parseGameState();
  const { entities, ...restState } = state;
  gameMap.setEntities(state.entities);

  // Index distances from all important points
  const pathfinder = gameMap.getPathfinder();
  pathfinder.clear();

  const roots = gameMap.findRoots();
  const myOrgans = gameMap.findMyOrgans();
  const allResources = gameMap.findResources();
  const allEntities = [...myOrgans, ...allResources, ...roots];

  for (const entity of allEntities) {
    pathfinder.indexDistancesFrom(entity);
  }

  const resources = allResources
    // Filter harvested resources
    .filter((cell) => {
      const neighbours = gameMap.getCellNeighbors(cell.id);
      const isHarvested = neighbours.some((neighbour) => {
        const isMyOrgan = neighbour.entity?.owner === 1;
        const isHarvester = neighbour.entity?.type === ORGAN_TYPES.HARVESTER;
        const isFaced = gameMap.isFacedTo(neighbour, cell);
        return isMyOrgan && isHarvester && isFaced;
      });
      return !isHarvested;
    });

  // Try to find the nearest resource to grow to
  function growToResource() {
    if (resources.length === 0) return false;
    const myOrgansIds = myOrgans.map((organ) => organ.id);
    const resourcesIds = resources.map((resource) => resource.id);
    const resourceConnection = pathfinder.getBestConnection(
      myOrgansIds,
      resourcesIds
    );
    if (!resourceConnection) return false;

    const [fromId, nextId] = resourceConnection.path;
    if (!nextId) {
      console.error(
        "[ERR] No next step found",
        JSON.stringify(resourceConnection)
      );
      return false;
    }

    const fromCell = gameMap.getCellById(fromId)!;
    const nextCell = gameMap.getCellById(nextId)!;
    const resCell = gameMap.getCellById(resourceConnection.toId)!;

    const organId = fromCell.entity?.organId;
    if (!organId) {
      console.error("[ERR] No organ id found", fromCell);
      return false;
    }

    // Grow with harvester
    if (resourceConnection.distance === 2 && canAffordHarvester(state)) {
      const dir = gameMap.getDirectionName(nextCell, resCell);
      if (!dir) {
        console.error("[ERR] Invalid direction:", dir, nextCell, resCell);
        return false;
      }
      console.log(
        `GROW ${organId} ${nextCell.x} ${nextCell.y} HARVESTER ${dir}`
      );
      return true;
    }

    console.log(`GROW ${organId} ${nextCell.x} ${nextCell.y} BASIC`);
    return true;
  }

  if (growToResource()) continue;

  gameMap.indexTerritories();

  // Grow to neutral territory
  function growToNeutral() {
    const neutralIds: number[] = [];
    const territories = gameMap.getTerritories();
    territories.forEach((terrCell) => {
      if (terrCell.diff === 0 || terrCell.diff === 1) {
        neutralIds.push(terrCell.id);
      }
    });
    if (neutralIds.length === 0) return false;

    const myOrgansIds = myOrgans.map((organ) => organ.id);
    const connection = pathfinder.getBestConnection(myOrgansIds, neutralIds);
    if (!connection) return false;

    const toCell = gameMap.getCellById(connection.toId)!;
    const [fromId, nextId] = connection.path;
    if (!nextId) {
      console.error("[ERR] No next step found", JSON.stringify(connection));
      return false;
    }

    const fromCell = gameMap.getCellById(fromId)!;
    const nextCell = gameMap.getCellById(nextId)!;

    const organId = fromCell.entity?.organId;
    if (!organId) {
      console.error("[ERR] No organ id found", fromCell);
      return false;
    }

    console.log(`GROW ${organId} ${nextCell.x} ${nextCell.y} BASIC N`);
    return true;
  }

  if (growToNeutral()) continue;

  function claimFreeCells() {
    const territories = gameMap.getMyTerritories();
    territories.sort(
      (a, b) =>
        (a.myConnection?.distance ?? Number.POSITIVE_INFINITY) -
        (b.myConnection?.distance ?? Number.POSITIVE_INFINITY)
    );

    const [terrCell] = territories;
    if (!terrCell) return false;

    const connection = terrCell.myConnection;
    if (!connection) return false;

    const [fromId, nextId] = connection.path;
    if (!nextId) {
      console.error("[ERR] No next step found", JSON.stringify(connection));
      return false;
    }

    const fromCell = gameMap.getCellById(fromId)!;
    const nextCell = gameMap.getCellById(nextId)!;
    const organId = fromCell.entity?.organId;
    if (!organId) {
      console.error("[ERR] No organ id found", fromCell);
      return false;
    }

    console.log(`GROW ${organId} ${nextCell.x} ${nextCell.y} BASIC N`);
    return true;
  }

  if (claimFreeCells()) continue;

  console.log("WAIT");
}

/* GameState helpers */

function canAfford(resources: Resources, costs: Resources) {
  return resources.every((resource, index) => resource >= costs[index]);
}

function canAffordBasic(state: GameState) {
  return canAfford(state.myResources, ORGAN_COSTS.BASIC);
}

function canAffordHarvester(state: GameState) {
  return canAfford(state.myResources, ORGAN_COSTS.HARVESTER);
}

function canAffordTentacle(state: GameState) {
  return canAfford(state.myResources, ORGAN_COSTS.TENTACLE);
}
