export interface Distance {
  from: number;
  to: number;
  distance: number;
}

export class DistanceGraph {
  private distances: Int32Array;
  private sorted: Map<number, Distance[]>;

  constructor(private readonly size: number) {
    // Initialize array with -1 values (unknown distances)
    this.distances = new Int32Array(size * size);
    this.sorted = new Map();
    this.clear();
  }

  private getIndex(fromId: number, toId: number): number {
    return fromId * this.size + toId;
  }

  hasDistance(fromId: number, toId: number): boolean {
    const index = this.getIndex(fromId, toId);
    return this.distances[index] !== -1;
  }

  setDistance(fromId: number, toId: number, distance: number): void {
    // Store distance both ways since the graph is undirected
    const index1 = this.getIndex(fromId, toId);
    const index2 = this.getIndex(toId, fromId);
    this.distances[index1] = distance;
    this.distances[index2] = distance;
  }

  getDistance(fromId: number, toId: number): number {
    const index = this.getIndex(fromId, toId);
    return this.distances[index];
  }

  getAllFrom(fromId: number): Distance[] {
    const result: Distance[] = [];
    for (let toId = 0; toId < this.size; toId++) {
      const distance = this.getDistance(fromId, toId);
      if (distance <= 0) continue;

      result.push({
        from: fromId,
        to: toId,
        distance,
      });
    }
    return result;
  }

  isCalculated(fromId: number): boolean {
    const distance = this.getDistance(fromId, fromId);
    return distance !== -1;
  }

  clear(): void {
    this.distances.fill(-1);
    this.sorted.clear();
  }

  /** Returns array of distances sorted by distance from fromId, excluding unreachable cells */
  getSortedByDistance(fromId: number): Distance[] {
    if (this.sorted.has(fromId)) {
      return this.sorted.get(fromId)!;
    }

    const result = this.getAllFrom(fromId);
    result.sort((a, b) => a.distance - b.distance);
    this.sorted.set(fromId, result);
    return result;
  }
}
