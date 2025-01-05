> 🌱 **League Based Challenge**
>
> This is a **league based** challenge. Multiple leagues for the same game are available. Once you have proven your skills against the first Boss, you will access a higher league and extra rules will be available.
>
> **NEW:** In low leagues, your submission will only fight the boss in the arena. Win a best-of-five to advance.

## Congratulations

Your organism can **fight**!

However, your organism has been **alone** so far. But with the power of a `SPORER` type organ, you can grow entirely **new organisms**.

![SPORER organ example](https://static.codingame.com/servlet/fileservlet?id=132396021519497)
_The SPORER organ._

## SPORER Rules

The `SPORER` type organ is unique in two ways:

- It is the only organ that can create a new `ROOT` organ.
- To create a new `ROOT`, it shoots out a spore in a straight line, letting you place the new organ in any of the free spaces it is facing.

_Note: a `ROOT` organ never has a **parent**, even when spawned from a `SPORER`._

![SPORER direction example](https://static.codingame.com/servlet/fileservlet?id=132395742195955)
_This command will make the `SPORER` shoot a new `ROOT` to the South._

When you control **multiple** organisms, you must output one command for **each one**. They will perform their actions simultaneously.

The `requiredActionsCount` variable will keep track of how many organisms you have. You **must** use the `WAIT` command for any organism that cannot act.

_Note: You can use the `organRootId` variable to find out which organs belong to the same organism._

To grow a `SPORER` you need `1` `B` type protein and `1` `D` type protein.
To spore a new `ROOT` you need `1` of each protein.

Here is a table to summarize all organ costs:

| Organ     | A   | B   | C   | D   |
| --------- | --- | --- | --- | --- |
| BASIC     | 1   | 0   | 0   | 0   |
| HARVESTER | 0   | 0   | 1   | 1   |
| TENTACLE  | 0   | 1   | 1   | 0   |
| SPORER    | 0   | 1   | 0   | 1   |
| ROOT      | 1   | 1   | 1   | 1   |

In this league, there is **one** protein source but your starting organism is not close enough to **harvest it**.

**Use a sporer to shoot a new `ROOT` towards the protein and grow larger than your opponent!**

## TENTACLE Rules

On each turn, right after **harvesting**, any `TENTACLE` organs facing an opponent organ will **attack**, causing the target organ to **die**. Attacks happen simultaneously.

![TENTACLE direction example](https://static.codingame.com/servlet/fileservlet?id=132395781400673)
_This command will create a new `TENTACLE` facing `E` (East), causing the opponent organ to be attacked._

When an organ **dies**, all of its **children** also die. This will propagate to the **entire** organism if the `ROOT` is hit.

_Note: You can use the `organParentId` variable to keep track of each organ's children._

A tentacle also prevents the opponent from growing onto the tile it is facing.

To grow a `TENTACLE` you need `1` `B` type protein and `1` `C` type protein.

In this league, there are no **protein sources** but you start with a stock full of various proteins.
**Use them to grow a large organism and attack the opponent's organism!**

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
  - `TENTACLE` for a TENTACLE type organ
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

A single line per organism with its action:

- `GROW id x y type direction`: attempt to grow a new organ of type `type` at location `x`, `y` from organ with id `id`. If the target location is not a neighbour of `id`, the organ will be created on the shortest path to `x`, `y`.
- `SPORE id x y`: attempt to create a new `ROOT` organ at location `x`, `y` from the `SPORER` with id `id`.
- `WAIT`: do nothing.

Append text to your command and it will be displayed in the viewer.

### Constraints

Response time per turn ≤ `50`ms
Response time for the first turn ≤ `1000`ms

> 🌱 **What is in store for me in the higher leagues?**
>
> The extra rules available in higher leagues are:
>
> - An organ type to spawn more organisms
