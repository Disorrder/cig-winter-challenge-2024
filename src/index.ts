import { Clock } from "./Clock";
import { ORGAN_COSTS, ORGAN_TYPES } from "./const";
import { type Cell, GameMap } from "./map";
import { parseGameState, parseInitialInput } from "./parser";
import type { GameState, Resources } from "./types";

const clock = new Clock("main");

// Game initialization
const { width, height } = parseInitialInput();
const gameMap = new GameMap(width, height);
let initialTerritories: number[] | undefined;

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

  function growToEnemy() {
    const sources = myOrgans.map((organ) => organ.id);
    const targets = gameMap.findEnemyOrgans().map((organ) => organ.id);
    const connection = pathfinder.getBestConnection(sources, targets);
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

  if (growToEnemy()) continue;

  // if (!initialTerritories) {
  //   initialTerritories = getMapTerritories();
  // }

  // const neutralTerritories = getInitiallyNeutralTerritories();
  // const [centralCell] = neutralTerritories;
  // if (!centralCell) {
  //   console.error("[ERR] No central cell found");
  //   continue;
  // }

  // const closestOrgan = gameMap.findMyOrgans()[0];
  // const pathToCenter = pathFinderGraph.getPath;

  console.log("WAIT");
}

/* GameState helpers */

function canAfford(resources: Resources, costs: Resources) {
  return resources.every((resource, index) => resource >= costs[index]);
}

function canAffordHarvester(state: GameState) {
  return canAfford(state.myResources, ORGAN_COSTS.HARVESTER);
}

/**
 * For each cell, calculate the distance to my and enemy's nearest organ. Get the difference between two distances.
 * If the difference is negative, the cell belongs to my territory.
 * If the difference is positive, the cell belongs to enemy's territory.
 * If the difference is 0, the cell is neutral.
 */
function getMapTerritories(): number[] {
  const pathfinderGraph = gameMap.getPathfinder();
  const myOrgans = gameMap.findMyOrgans();
  const enemyOrgans = gameMap.findEnemyOrgans();
  const territories = new Array<number>(gameMap.width * gameMap.height).fill(0);

  territories.forEach((_, id) => {
    const cell = gameMap.getCellById(id);
    if (!cell) return;
    const myEdges = myOrgans.map((organ) =>
      pathfinderGraph.getDistance(id, organ.id)
    );
    const enemyEdges = enemyOrgans.map((organ) =>
      pathfinderGraph.getDistance(id, organ.id)
    );
    const myMinDistance = Math.min(...myEdges);
    const enemyMinDistance = Math.min(...enemyEdges);
    territories[id] = myMinDistance - enemyMinDistance;
  });

  return territories;
}

function getInitiallyNeutralTerritories(): Cell[] {
  if (!initialTerritories) return [];
  const cells = gameMap.getCells();
  return cells.filter((cell) => {
    if (!cell) return false;
    return cell.isWalkable() && initialTerritories[cell.id] === 0;
  });
}

// /**
//  * @returns sorted distances to resources of the given owner, where `from` is always resource and `to` is the organ
//  */
// function sortResourcesByDistanceToOrgan(
//   resources: Cell[],
//   owner: PlayerOwner = 1
// ): GridPathfinderEdge[] {
//   const pathfinderGraph = gameMap.getPathfinder();
//   const distanceToResources: GridPathfinderEdge[] = [];

//   for (const resource of resources) {
//     const [distance] = pathfinderGraph
//       .getEdgesFrom(resource.id)
//       .filter((edge) => {
//         const to = gameMap.getCellById(edge.toId);
//         return to?.entity?.owner === owner;
//       })
//       .sort((a, b) => a.distance! - b.distance!);

//     if (distance) {
//       const to = gameMap.getCellById(distance.toId);
//       if (!to) {
//         console.error(
//           `[ERR] Distance to my organ is not calculated for resource (${resource.x},${resource.y})`
//         );
//         continue;
//       }
//       distanceToResources.push(distance);
//     }
//   }

//   distanceToResources.sort((a, b) => a.distance! - b.distance!);

//   return distanceToResources;
// }
