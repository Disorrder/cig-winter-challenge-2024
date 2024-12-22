/**
 * Grow and multiply your organisms to end up larger than your opponent.
 **/

// Read initial game setup
const [width, height] = readline().split(" ").map(Number.parseInt); // columns and rows in the game grid

// game loop
while (true) {
  const entityCount = Number.parseInt(readline());

  // Read entity information
  const entities = Array.from({ length: entityCount }, () => {
    const [x, y, type, owner, organId, organDir, organParentId, organRootId] =
      readline().split(" ");

    return {
      x: Number.parseInt(x),
      y: Number.parseInt(y),
      type, // WALL, ROOT, BASIC, TENTACLE, HARVESTER, SPORER, A, B, C, D
      owner: Number.parseInt(owner), // 1 if your organ, 0 if enemy organ, -1 if neither
      organId: Number.parseInt(organId), // id if it's an organ, 0 otherwise
      organDir, // N,E,S,W or X if not an organ
      organParentId: Number.parseInt(organParentId),
      organRootId: Number.parseInt(organRootId),
    };
  });

  // Read player resources
  const [myA, myB, myC, myD] = readline().split(" ").map(Number.parseInt); // your protein stock

  // Read opponent resources
  const [oppA, oppB, oppC, oppD] = readline().split(" ").map(Number.parseInt); // opponent's protein stock

  // Read required actions count
  const requiredActionsCount = Number.parseInt(readline());

  // Process each required action
  for (let i = 0; i < requiredActionsCount; i++) {
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');

    console.log("WAIT");
  }
}
