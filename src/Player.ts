import { Organ, Organism } from "./Organism";
import type { EntityData, Resources } from "./types";

import type { EntityOwner } from "./types";

export class Player {
  resources: Resources = [0, 0, 0, 0];
  organisms = new Map<number, Organism>();
  constructor(readonly id: EntityOwner) {}

  setResources(resources: Resources) {
    this.resources = resources;
  }

  setEntities(entities: EntityData[]) {
    const filteredEntities = entities.filter((e) => e.owner === this.id);
    filteredEntities.sort((a, b) => a.organId - b.organId);

    this.organisms.clear();
    filteredEntities.forEach((e) => {
      const organ = Organ.fromEntityData(e);
      if (organ.isRoot()) {
        const organism = new Organism(organ);
        this.organisms.set(organ.id, organism);
      } else {
        const organism = this.organisms.get(organ.rootId);
        if (!organism) {
          throw new Error("Organism not found");
        }
        organism.addOrgan(organ);
      }
    });

    const sumSizes = Array.from(this.organisms.values()).reduce(
      (acc, organism) => {
        return acc + organism.size;
      },
      0
    );
  }
}
