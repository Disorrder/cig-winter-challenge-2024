import { type GridConnection, GridPathfinder } from "./GridPathfinder";
import { DIRECTIONS, DIRECTION_VECTORS, type Direction } from "./const";
import type { Entity } from "./types";

export class GameMap {
  private cells: Cell[];
  private pathfinder: GridPathfinder;
  private territories: TerritoryCell[];
  // readonly disabledIds = new Set<number>();

  constructor(readonly width: number, readonly height: number) {
    // Initialize empty grid as 1D array
    this.cells = new Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const id = this.coordToIndex(x, y);
        this.cells[id] = new Cell(this, x, y);
      }
    }

    // Initialize pathfinder
    this.pathfinder = new GridPathfinder(this);
    // Initialize territories
    this.territories = new Array(this.width * this.height);
  }

  getPathfinder(): GridPathfinder {
    return this.pathfinder;
  }

  coordToIndex(x: number, y: number): number {
    return y * this.width + x;
  }

  indexToCoord(id: number): { x: number; y: number } {
    return { x: id % this.width, y: Math.floor(id / this.width) };
  }

  getCells(): Cell[] {
    return this.cells;
  }

  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.cells[this.coordToIndex(x, y)];
  }

  getCellById(id: number): Cell | null {
    if (id < 0 || id >= this.cells.length) {
      return null;
    }
    return this.cells[id];
  }

  getCellNeighbors(id: number): Cell[] {
    const cell = this.getCellById(id)!;
    const neighbors: Cell[] = [];
    for (const { x: dx, y: dy } of DIRECTION_VECTORS) {
      const neighbor = this.getCell(cell.x + dx, cell.y + dy);
      if (neighbor) neighbors.push(neighbor);
    }
    return neighbors;
  }

  getManhattanDistance(from: Cell, to: Cell): number {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
  }

  /** Works for neighbours only */
  getDirectionName(from: Cell, to: Cell): Direction | null {
    if (from.id === to.id) return null;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const index = DIRECTION_VECTORS.findIndex(
      ({ x, y }) => x === dx && y === dy
    );
    return index !== -1 ? DIRECTIONS[index] : null;
  }

  setEntities(entities: Entity[]): void {
    // Reset all cells
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].entity = null;
    }
    this.pathfinder.disabledIds.clear();

    // Update cells with new entities
    for (const entity of entities) {
      const cell = this.getCell(entity.x, entity.y);
      if (cell) {
        cell.entity = entity;
        this.pathfinder.disabledIds.add(cell.id);
      }
    }
  }

  findRoots(): Cell[] {
    return this.cells.filter((cell) => cell.isRoot());
  }

  findResources(): Cell[] {
    return this.cells.filter((cell) => cell.isResource());
  }

  findMyOrgans(): Cell[] {
    return this.cells.filter((cell) => cell.isMyOrgan());
  }

  findEnemyOrgans(): Cell[] {
    return this.cells.filter((cell) => cell.isEnemyOrgan());
  }

  isFacedTo(from: Cell, to: Cell): boolean {
    const { entity } = from;
    if (!entity) return false;
    const direction = this.getDirectionName(from, to);
    return entity.organDir === direction;
  }

  /* Territories (prolly need to move to separate class) */

  indexTerritories() {
    const pathfinder = this.getPathfinder();
    const myOrgans = this.findMyOrgans();
    const enemyOrgans = this.findEnemyOrgans();

    const myOrgansIds = myOrgans.map((organ) => organ.id);
    const enemyOrgansIds = enemyOrgans.map((organ) => organ.id);

    for (let id = 0; id < this.territories.length; id++) {}

    this.territories.length = 0;

    this.cells.forEach((cell) => {
      const { id } = cell;
      if (cell.isOrgan()) return;
      if (cell.isWall()) return;

      const myConnection = pathfinder.getBestConnection(myOrgansIds, [id]);
      const enemyConnection = pathfinder.getBestConnection(enemyOrgansIds, [
        id,
      ]);
      const diff =
        myConnection && enemyConnection
          ? myConnection.distance - enemyConnection.distance
          : null;
      this.territories[id] = {
        id,
        myConnection,
        enemyConnection,
        diff,
      };
    });

    this.territories = this.territories.filter(Boolean);
  }

  getTerritories(): TerritoryCell[] {
    return this.territories;
  }

  setTerritory(terrCell: TerritoryCell): void {
    this.territories[terrCell.id] = terrCell;
  }

  getNeutralTerritories(): TerritoryCell[] {
    return this.territories.filter(
      (terrCell) => terrCell.diff === 0 || terrCell.diff === 1
    );
  }

  getMyTerritories(): TerritoryCell[] {
    return this.territories.filter((terrCell) => {
      if (terrCell.diff !== null && terrCell.diff < 0) return true;
      if (terrCell.diff === null && terrCell.myConnection) return true;
      return false;
    });
  }

  getEnemyTerritories(): TerritoryCell[] {
    return this.territories.filter((terrCell) => terrCell.diff === -1);
  }
}

export class Cell {
  readonly id: number;
  entity: Entity | null = null;

  constructor(
    private readonly map: GameMap,
    readonly x: number,
    readonly y: number
  ) {
    this.id = map.coordToIndex(x, y);
  }

  isEmpty(): boolean {
    return this.entity === null;
  }

  isWall(): boolean {
    return this.entity?.type === "WALL";
  }

  isDynamicEntity(): boolean {
    const type = this.entity?.type;
    return Boolean(type) && type !== "WALL";
  }

  isResource(): boolean {
    const type = this.entity?.type;
    return type === "A" || type === "B" || type === "C" || type === "D";
  }

  isRoot(): boolean {
    return this.entity?.type === "ROOT";
  }

  isHarvester(): boolean {
    return this.entity?.type === "HARVESTER";
  }

  isTentacle(): boolean {
    return this.entity?.type === "TENTACLE";
  }

  isMyOrgan(): boolean {
    return this.entity?.owner === 1;
  }

  isEnemyOrgan(): boolean {
    return this.entity?.owner === 0;
  }

  isOrgan(): boolean {
    return this.isMyOrgan() || this.isEnemyOrgan();
  }

  isWalkable(): boolean {
    return !this.isWall() && !this.isMyOrgan() && !this.isEnemyOrgan();
  }

  distanceTo(other: Cell): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  toString(): string {
    const owner = this.isMyOrgan() ? "My" : this.isEnemyOrgan() ? "Enm" : "";
    const entityString = [owner, this.entity?.type].filter(Boolean).join(" ");
    return `Cell<(${this.x},${this.y}), ${entityString}>`;
  }
}

export interface TerritoryCell {
  id: number;
  myConnection?: GridConnection;
  enemyConnection?: GridConnection;
  diff: number | null;
}
