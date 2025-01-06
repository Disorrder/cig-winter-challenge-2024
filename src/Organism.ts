import type { Direction } from "./const";
import type { EntityData, EntityOwner, EntityType } from "./types";

export class Organ {
  parent: Organ | null = null;
  children: Organ[] = [];

  constructor(
    readonly x: number,
    readonly y: number,
    readonly type: EntityType,
    readonly ownerId: EntityOwner,
    readonly id: number,
    readonly direction: Direction,
    readonly parentId: number,
    readonly rootId: number
  ) {}

  static fromEntityData(data: EntityData): Organ {
    return new Organ(
      data.x,
      data.y,
      data.type,
      data.owner,
      data.organId,
      data.organDir,
      data.organParentId,
      data.organRootId
    );
  }

  isRoot(): boolean {
    return this.type === "ROOT";
  }

  setParent(parent: Organ) {
    this.parent = parent;
    parent.children.push(this);
  }
}

export class Organism {
  private readonly organs: Map<number, Organ> = new Map();
  readonly rootId: number;

  constructor(readonly root: Organ) {
    this.rootId = root.id;
    this.organs.set(root.id, root);
  }

  get size(): number {
    return this.organs.size;
  }

  getRoot(): Organ {
    const root = this.organs.get(this.rootId);
    if (!root) throw new Error("Root organ not found");
    return root;
  }

  addOrgan(organ: Organ) {
    this.organs.set(organ.id, organ);
    const parent = this.organs.get(organ.parentId);
    if (!parent) throw new Error("Parent organ not found");
    organ.setParent(parent);
  }

  getAllOrgans(): Organ[] {
    return Array.from(this.organs.values());
  }
}
