import { Clock } from "./Clock";
import { Player } from "./Player";
import { ORGAN_COSTS, ORGAN_TYPES } from "./const";
import { GameMap } from "./map";
import { parseGameState, parseInitialInput } from "./parser";
import type { GameState, Resources } from "./types";

const clock = new Clock("main");

// Game initialization
const { width, height } = parseInitialInput();
const gameMap = new GameMap(width, height);
const opponent = new Player(0);
const me = new Player(1);

// game loop
while (true) {
  clock.stop("frame end");
  clock.start();

  const state = parseGameState();
  const { entities, ...restState } = state;
  gameMap.setEntities(state.entities);
  me.setResources(restState.myResources);
  me.setEntities(state.entities);
  opponent.setResources(restState.oppResources);
  opponent.setEntities(state.entities);

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

  gameMap.indexTerritories();
  const commands: string[] = [];

  me.organisms.forEach((organism) => {
    const organs = organism.getAllOrgans();
    const organIds = organs.map((organ) => organ.id);
    const organCellIds = organs.map(
      (organ) => gameMap.getCell(organ.x, organ.y)!.id
    );
    const resourcesIds = resources.map((resource) => resource.id);
    const nearestResourceConnection = pathfinder.getBestConnection(
      organCellIds,
      resourcesIds
    );

    function sporeResource() {
      if (!nearestResourceConnection) return false;
      if (nearestResourceConnection.distance < 5) return false;
      if (!canAffordRoot(state)) return false;

      const resourceCell = gameMap.getCellById(nearestResourceConnection.toId)!;

      // Find a spot to grow a new root nearby the resource
      const newRootSpots = pathfinder.getEdgesFrom(resourceCell.id);
      const newRootSpot = newRootSpots.find((edge) => {
        if (edge.distance !== 2) return false;
        const toCell = gameMap.getCellById(edge.toId)!;
        if (toCell.entity) return false;
        // TODO: refactor to vectors and not from root
        const dy = toCell.y - organism.root.y;
        if (Math.abs(dy) > 1) return false;
        return true;
      });
      if (!newRootSpot) return false;
      const newRootSpotCell = gameMap.getCellById(newRootSpot.toId)!;

      // Build sporer if not present
      const sporer = organs.find((organ) => organ.type === ORGAN_TYPES.SPORER);
      if (!sporer) {
        if (!canAffordSporer(state)) return false;
        const sporerSpots = gameMap.getCellNeighbors(organism.root.id);
        const sporerSpot = sporerSpots.find((cell) => {
          if (cell.entity) return false;
          if (cell.y === newRootSpotCell.y) return true;
          return false;
        });
        if (!sporerSpot) return false;
        commands.push(
          `GROW ${organism.root.id} ${sporerSpot.x} ${sporerSpot.y} SPORER E`
        );
        return true;
      }

      // Spore a new root
      commands.push(
        `SPORE ${sporer.id} ${newRootSpotCell.x} ${newRootSpotCell.y} CUMSHOT!`
      );
      return true;
    }

    if (sporeResource()) return;

    // Try to find the nearest resource to grow to
    function growToResource() {
      if (resources.length === 0) return false;
      if (!nearestResourceConnection) return false;

      const [fromId, nextId] = nearestResourceConnection.path;
      if (!nextId) {
        console.error(
          "[ERR] No next step found",
          JSON.stringify(nearestResourceConnection)
        );
        return false;
      }

      const fromCell = gameMap.getCellById(fromId)!;
      const nextCell = gameMap.getCellById(nextId)!;
      const resCell = gameMap.getCellById(nearestResourceConnection.toId)!;

      const organId = fromCell.entity?.organId;
      if (!organId) {
        console.error(
          "[ERR] growToResource: No organ id found",
          fromCell.toString(),
          nearestResourceConnection.path
        );
        return false;
      }

      // Grow with harvester
      if (
        nearestResourceConnection.distance === 2 &&
        canAffordHarvester(state)
      ) {
        const dir = gameMap.getDirectionName(nextCell, resCell);
        if (!dir) {
          console.error("[ERR] Invalid direction:", dir, nextCell, resCell);
          return false;
        }
        commands.push(
          `GROW ${organId} ${nextCell.x} ${nextCell.y} HARVESTER ${dir}`
        );
        return true;
      }

      commands.push(`GROW ${organId} ${nextCell.x} ${nextCell.y} BASIC`);
      return true;
    }

    if (growToResource()) return;

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

      const connection = pathfinder.getBestConnection(organCellIds, neutralIds);
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

      commands.push(`GROW ${organId} ${nextCell.x} ${nextCell.y} BASIC N`);
      return true;
    }

    if (growToNeutral()) return;

    function claimFreeCells() {
      const territories = gameMap.getMyTerritories();
      territories.sort(
        (a, b) =>
          (b.myConnection?.distance ?? Number.POSITIVE_INFINITY) -
          (a.myConnection?.distance ?? Number.POSITIVE_INFINITY)
      );

      const terrCell = territories.find((terr) => {
        const fromId = terr.myConnection?.fromId;
        if (!fromId) return false;
        const fromCell = gameMap.getCellById(fromId);
        if (!fromCell) return false;
        return fromCell.entity?.organRootId === organism.root.id;
      });
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

      commands.push(`GROW ${organId} ${nextCell.x} ${nextCell.y} BASIC N`);
      return true;
    }

    if (claimFreeCells()) return;

    commands.push("WAIT");
  });

  commands.forEach((command) => {
    console.log(command);
  });
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

function canAffordSporer(state: GameState) {
  return canAfford(state.myResources, ORGAN_COSTS.SPORER);
}

function canAffordRoot(state: GameState) {
  return canAfford(state.myResources, ORGAN_COSTS.ROOT);
}
