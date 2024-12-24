import type { Distance } from "./DistanceGraph";
import { type Cell, GameMap } from "./map";
import { parseGameState, parseInitialInput } from "./parser";
import type { PlayerOwner } from "./types";

// Game initialization
const { width, height } = parseInitialInput();
const gameMap = new GameMap(width, height);

// game loop
while (true) {
  const state = parseGameState();
  gameMap.setEntities(state.entities);

  // Calculate distances from all important points
  const distancesGraph = gameMap.getDistances();
  distancesGraph.clear();

  const roots = gameMap.findRoots();
  const myOrgans = gameMap.findMyOrgans();
  const resources = gameMap.findResources();
  const allEntities = [...myOrgans, ...resources, ...roots];

  for (const entity of allEntities) {
    gameMap.calculateAllFrom(entity);
  }

  const resourceDistances = sortResourcesByDistanceToOrgan(resources);
  const closestResourceDistance = resourceDistances[0];

  if (closestResourceDistance) {
    const closestOrgan = gameMap.getCellById(closestResourceDistance.to);
    const closestResource = gameMap.getCellById(closestResourceDistance.from);
    const organId = closestOrgan?.entity?.organId;

    if (organId && closestResource) {
      console.log(
        `GROW ${organId} ${closestResource.x} ${closestResource.y} BASIC`
      );
      continue;
    }
  }

  console.log("WAIT");
}

/**
 * @returns sorted distances to resources of the given owner, where `from` is always resource and `to` is the organ
 */
function sortResourcesByDistanceToOrgan(
  resources: Cell[],
  owner: PlayerOwner = 1
): Distance[] {
  const distancesGraph = gameMap.getDistances();
  const distanceToResources: Distance[] = [];

  for (const resource of resources) {
    const [distance] = distancesGraph
      .getAllFrom(resource.id)
      .filter((distance) => {
        const to = gameMap.getCellById(distance.to);
        return to?.entity?.owner === owner;
      })
      .sort((a, b) => a.distance - b.distance);

    if (distance) {
      const to = gameMap.getCellById(distance.to);
      if (!to) {
        console.error(
          `[ERR] Distance to my organ is not calculated for resource (${resource.x},${resource.y})`
        );
        continue;
      }
      distanceToResources.push(distance);
    }
  }

  distanceToResources.sort((a, b) => a.distance - b.distance);

  return distanceToResources;
}
