import type { Direction } from "./const";
import type { EntityType } from "./types";

export interface GrowCommand {
  type: "GROW";
  id: number;
  x: number;
  y: number;
  organType: EntityType;
  direction: Direction;
}

export interface SporeCommand {
  type: "SPORE";
  id: number;
  x: number;
  y: number;
}

export interface WaitCommand {
  type: "WAIT";
}

export type Command = GrowCommand | SporeCommand | WaitCommand;

export function commandToString(command: Command): string {
  switch (command.type) {
    case "GROW":
      return `GROW ${command.id} ${command.x} ${command.y} ${command.organType} ${command.direction}`;
    case "SPORE":
      return `SPORE ${command.id} ${command.x} ${command.y}`;
    case "WAIT":
      return "WAIT";
  }
}
