> 🌱 **League Based Challenge**
>
> This is a **league based** challenge. Multiple leagues for the same game are available. Once you have proven your skills against the first Boss, you will access a higher league and extra rules will be available.
>
> **NEW:** In low leagues, your submission will only fight the boss in the arena. Win a best-of-five to advance.

## Congratulations

Your organism can **grow**!

However, **protein sources** on the grid are limited, and once you absorb them, they are gone. This is where the `HARVESTER` type organ comes in.

## HARVESTER Rules

From this league onwards, organs you place may be given a `direction`.

![HARVESTER organ example](https://static.codingame.com/servlet/fileservlet?id=132395829688056)
_The HARVESTER organ._

If a `HARVESTER` is facing a tile with a **protein source**, you will receive `1` of that protein on **every end of turn**.

![HARVESTER direction example](https://static.codingame.com/servlet/fileservlet?id=132395760074979)
_This command will create new `HARVESTER` facing `N` (North)._

_Note: each player gains only `1` protein from each source per turn, even if multiple harvesters are facing that source._

To grow a `HARVESTER` you need `1` `C` type protein and `1` `D` type protein.

In this league, you are given an extra `1` `C` type protein and `1` `D` type protein, **use them to grow a harvester at the correct location to grow your organism indefinitely!**

## Rules

The game is played on a grid.

For the lower leagues, you need only beat the Boss in specific situations.

### 🔵🔴 The Organisms

**Organisms** are made up of **organs** that take up `1` tile of space on the game grid.

Each player starts with a `ROOT` type organ. Your organism can `GROW` a new organ on each turn in order to cover a larger area.

A new organ can grow **from** any existing **organ**, onto an **empty adjacent location**.

In order to `GROW`, your organism needs **proteins**. Growing 1 `BASIC` organ requires `1` protein of type A.

You can obtain more **proteins** by growing an organ onto a tile of the grid containing a **protein source**, these are tiles with a letter in them. Doing so will grant you `3` proteins of the corresponding type.

**Grow more organs than the Boss to advance to the next league.**

Your organism can receive the following command:

- `GROW id x y type direction`: creates a new organ at location `x`, `y` from organ with id `id`. If the target location is not a neighbour of `id`, the organ will be created on the shortest path to `x`, `y`.

![GROW command example](https://static.codingame.com/servlet/fileservlet?id=132395721182727)
_This command will create new `BASIC` organ with the `ROOT` organ as its parent._

### ⛔ Game end

The game stops when it detects progress can no longer be made or after `100` turns.

#### Victory Conditions

- The winner is the player with the most tiles occupied by one of their organs.

#### Defeat Conditions

- Your program does not provide a command in the alloted time or one of the commands is invalid.

### 🐞 Debugging tips

- Hover over the grid to see extra information on the organ under your mouse.
- Append text after any command and that text will appear above your organism.
- Press the gear icon on the viewer to access extra display options.
- Use the keyboard to control the action: space to play/pause, arrows to step 1 frame at a time.

## Game Protocol

### Initialization Input

First line: two integers `width` and `height` for the size of the grid.

### Input for One Game Turn

First line: one integer `entityCount` for the number of entities on the grid.

Next `entityCount` lines: the following `7` inputs for each entity:

- `x`: X coordinate (`0` is leftmost)
- `y`: Y coordinate (`0` is topmost)
- `type`:
  - `WALL` for a wall
  - `ROOT` for a ROOT type organ
  - `BASIC` for a BASIC type organ
  - `HARVESTER` for a HARVESTER type organ
  - `A` for an A protein source
- `owner`:
  - `1` if you are the owner of this organ
  - `0` if your opponent owns this organ
  - `-1` if this is not an organ
- `organId`: unique id of this entity if it is an organ, `0` otherwise
- `organDir`: `N`, `W`, `S`, or `E` for the direction in which this organ is facing
- `organParentId`: if it is an organ, the `organId` of the organ that this organ grew from (0 for `ROOT` organs), else `0`
- `organRootId`: if it is an organ, the `organId` of the `ROOT` that this organ originally grew from, else `0`

Next line: `4` integers: `myA`,`myB`,`myC`,`myD` for the amount of each protein type you have.

Next line: `4` integers: `oppA`,`oppB`,`oppC`,`oppD` for the amount of each protein type your opponent has.

Next line: the integer `requiredActionsCount` which equals `1` _in this league_.

### Output

A single line with your action:

- `GROW id x y type direction`: attempt to grow a new organ of type `type` at location `x`, `y` from organ with id `id`. If the target location is not a neighbour of `id`, the organ will be created on the shortest path to `x`, `y`.

> 🌱 **What is in store for me in the higher leagues?**
>
> The extra rules available in higher leagues are:
>
> - An organ type to attack your opponent
> - An organ type to spawn more organisms
