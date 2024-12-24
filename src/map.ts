import { DistanceGraph } from "./DistanceGraph";
import type { Entity } from "./types";

export class GameMap {
  private cells: Cell[];
  private distances: DistanceGraph;

  constructor(readonly width: number, readonly height: number) {
    // Initialize empty grid as 1D array
    this.cells = new Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const id = this.coordToIndex(x, y);
        this.cells[id] = new Cell(this, x, y);
      }
    }

    // Initialize distances graph
    this.distances = new DistanceGraph(width * height);
  }

  // Add getter for distances
  getDistances(): DistanceGraph {
    return this.distances;
  }

  coordToIndex(x: number, y: number): number {
    return y * this.width + x;
  }

  indexToCoord(id: number): { x: number; y: number } {
    return { x: id % this.width, y: Math.floor(id / this.width) };
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

  setEntities(entities: Entity[]): void {
    // Reset all cells
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].entity = null;
    }

    // Update cells with new entities
    for (const entity of entities) {
      const cell = this.getCell(entity.x, entity.y);
      if (cell) {
        cell.entity = entity;
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

  /** BFS from the source cell to all other cells, setting distances to -1 for unreachable cells */
  calculateAllFrom(from: Cell): void {
    const distances = this.getDistances();
    const visited = new Set<number>();
    const queue: Array<[Cell, number]> = [[from, 0]];

    visited.add(from.id);
    distances.setDistance(from.id, from.id, 0);

    while (queue.length > 0) {
      const [current, distance] = queue.shift()!;

      for (const neighbor of current.getNeighbors()) {
        if (visited.has(neighbor.id)) continue;
        visited.add(neighbor.id);

        if (neighbor.isWall()) continue;
        distances.setDistance(from.id, neighbor.id, distance + 1);

        // Organs ain't walkable, but we can get close to them
        if (neighbor.isMyOrgan() || neighbor.isEnemyOrgan()) continue;
        queue.push([neighbor, distance + 1]);
      }
    }

    for (const cell of this.cells) {
      if (!visited.has(cell.id)) {
        distances.setDistance(from.id, cell.id, -1);
      }
    }
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

  isMyOrgan(): boolean {
    return this.entity?.owner === 1;
  }

  isEnemyOrgan(): boolean {
    return this.entity?.owner === 0;
  }

  isWalkable(): boolean {
    return !this.isWall() && !this.isMyOrgan() && !this.isEnemyOrgan();
  }

  distanceTo(other: Cell): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  getNeighbors(): Cell[] {
    const neighbors: Cell[] = [];
    const directions = [
      { dx: 0, dy: -1 }, // North
      { dx: 1, dy: 0 }, // East
      { dx: 0, dy: 1 }, // South
      { dx: -1, dy: 0 }, // West
    ];

    for (const { dx, dy } of directions) {
      const neighbor = this.map.getCell(this.x + dx, this.y + dy);
      if (!neighbor) continue;
      if (neighbor.isWall()) continue;
      neighbors.push(neighbor);
    }

    return neighbors;
  }

  toString(): string {
    const owner = this.isMyOrgan() ? "My" : this.isEnemyOrgan() ? "Enm" : "";
    const entityString = [owner, this.entity?.type].filter(Boolean).join(" ");
    return `Cell<(${this.x},${this.y}), ${entityString}>`;
  }
}
