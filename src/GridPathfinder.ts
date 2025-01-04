import type { Cell, GameMap } from "./map";

export class GridPathfinder {
  private readonly size: number;
  /** N * N grid of edges */
  private edges: GridPathfinderEdge[];
  /** Key is the source cell id, value is the rest cells sorted by distance */
  private sortedCache: Map<number, GridPathfinderEdge[]>;
  disabledIds = new Set<number>();

  constructor(private readonly map: GameMap) {
    this.size = map.width * map.height;
    // Initialize array with -1 values (unknown distances)
    this.edges = new Array(this.size * this.size);
    this.sortedCache = new Map();
    this.clear();
  }

  private getIndex(fromId: number, toId: number): number {
    return fromId * this.size + toId;
  }

  getEdge(fromId: number, toId: number): GridPathfinderEdge | undefined {
    const index = this.getIndex(fromId, toId);
    return this.edges[index];
  }

  hasDistance(fromId: number, toId: number): boolean {
    const edge = this.getEdge(fromId, toId);
    return (
      edge?.distance !== undefined && edge.distance !== Number.POSITIVE_INFINITY
    );
  }

  setDistance(
    fromId: number,
    toId: number,
    distance: number,
    prevId?: number
  ): void {
    const edge = this.getEdge(fromId, toId);
    if (!edge) return;
    edge.distance = distance;
    edge.prevId = prevId;

    const reverseEdge = this.getEdge(toId, fromId);
    if (!reverseEdge) return;
    reverseEdge.distance = distance;
  }

  getDistance(fromId: number, toId: number): number {
    const edge = this.getEdge(fromId, toId);
    return edge?.distance ?? Number.POSITIVE_INFINITY;
  }

  getEdgesFrom(fromId: number): GridPathfinderEdge[] {
    const fromIndex = fromId * this.size;
    return this.edges.slice(fromIndex, fromIndex + this.size);
  }

  isIndexed(fromId: number): boolean {
    const distance = this.getDistance(fromId, fromId);
    return distance !== Number.POSITIVE_INFINITY;
  }

  clear(): void {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const id = i * this.size + j;
        this.edges[id] = {
          fromId: i,
          toId: j,
        };
      }
    }
    this.sortedCache.clear();
  }

  getPath(fromId: number, toId: number) {
    const edges = this.getEdgesFrom(fromId);
    const path: number[] = [];
    let current = toId;
    while (current !== fromId) {
      path.push(current);
      const edge = edges.find((edge) => {
        return edge.toId === current;
      });
      if (!edge) {
        console.error(`[ERR] Edge not found for id ${current}.`, path);
        break;
      }

      console.error("🚀 ~ GridPathfinder ~ getPath ~ edge:", edge);
      current = edge.prevId!;
    }
    path.push(fromId);
    return path.reverse();
  }

  /** Returns array of distances sorted by distance from fromId */
  getEdgesSortedByDistance(fromId: number): GridPathfinderEdge[] {
    if (this.sortedCache.has(fromId)) {
      return this.sortedCache.get(fromId)!;
    }

    const result = this.getEdgesFrom(fromId);
    result.sort((a, b) => {
      const aDistance = a.distance ?? Number.POSITIVE_INFINITY;
      const bDistance = b.distance ?? Number.POSITIVE_INFINITY;
      return aDistance - bDistance;
    });
    this.sortedCache.set(fromId, result);
    return result;
  }

  /** BFS from the source cell to all other cells, setting distances to -1 for unreachable cells */
  indexDistancesFrom(from: Cell): void {
    const visited = new Set<number>();
    /** Sorted queue of cells to visit, sorted by score. */
    const queue = new Array<GridPathfinderEdge>();

    visited.add(from.id);
    this.setDistance(from.id, from.id, 0);
    const edge = this.getEdge(from.id, from.id)!;
    queue.push(edge);

    while (queue.length > 0) {
      const edge = queue.shift()!;
      const currentCell = this.map.getCellById(edge.toId)!;

      for (const neighbor of this.map.getCellNeighbors(currentCell.id)) {
        if (visited.has(neighbor.id)) continue;
        visited.add(neighbor.id);

        // const hScore = this.getManhattanDistance(from, neighbor);
        // const gScore = current.gScore + 1;
        // const score = gScore + hScore;
        const score = edge.distance! + 1;
        this.setDistance(from.id, neighbor.id, score, currentCell.id);
        // Skip disabled cells, but save their distances if neighbor is not disabled
        if (this.disabledIds.has(neighbor.id)) continue;

        const newEdge = this.getEdge(from.id, neighbor.id)!;
        queue.push(newEdge);
      }
    }

    for (const cell of this.map.getCells()) {
      if (!visited.has(cell.id)) {
        this.setDistance(from.id, cell.id, -1);
      }
    }
  }

  getBestConnection(
    fromIds: number[],
    toIds: number[]
  ): GridConnection | undefined {
    let bestEdge: GridPathfinderEdge | null = null;

    for (const fromId of fromIds) {
      for (const toId of toIds) {
        const edge = this.getEdge(fromId, toId);
        if (!edge) continue;
        if (edge.distance! < 0) continue;
        if (!bestEdge || edge.distance! < bestEdge.distance!) {
          bestEdge = edge;
        }
      }
    }

    if (!bestEdge) return undefined;
    const path = this.getPath(bestEdge.fromId, bestEdge.toId);
    return {
      fromId: bestEdge.fromId,
      toId: bestEdge.toId,
      distance: path.length - 1,
      path,
    };
  }
}

export interface GridPathfinderEdge {
  fromId: number;
  toId: number;
  /** Id of the previous cell in the path */
  prevId?: number;
  /** Distance from the source cell */
  distance?: number;
}

export interface GridConnection {
  fromId: number;
  toId: number;
  distance: number;
  path: number[];
}
