export class PriorityQueue<T> {
  private items: T[] = [];

  constructor(private readonly compare: (a: T, b: T) => number) {}

  push(item: T): void {
    this.items.push(item);
    this.items.sort(this.compare);
  }

  shift(): T | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  contains(item: T): boolean {
    return this.items.includes(item);
  }
}
