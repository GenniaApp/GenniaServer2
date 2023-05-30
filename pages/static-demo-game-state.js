// map Array<[type, visable, playerId, unitiesCount]>
//  type {enum}
//    0: base
//    1: spawner
//    2: fog
//    3: army
//    4: blank
// isRevealed {boolean}
// playerId {number}
// unitiesCount {number}
const [BASE, SPAWNER, FOG, ARMY, BLANK] = [0, 1, 2, 3, 4];

const map = [
  [
    [ARMY, false, null, null],
    [ARMY, true, null, null],
    [BASE, true, 1, 3],
    [SPAWNER, true, null, 48],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
  ],
  [
    [FOG, false, null, null],
    [ARMY, true, null, null],
    [BLANK, true, null, null],
    [ARMY, true, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
  ],
  [
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [BLANK, true, null, null],
    [ARMY, true, null, null],
    [ARMY, true, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
  ],
  [
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [ARMY, false, null, null],
    [SPAWNER, true, null, 48],
    [BASE, true, 2, 3],
    [ARMY, true, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
  ],
  [
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [FOG, false, null, null],
    [ARMY, true, null, null],
    [ARMY, true, null, null],
    [ARMY, true, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
  ],
  [
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
  ],
  [
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [ARMY, false, null, null],
  ],
  [
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [FOG, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
  ],
  [
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [ARMY, false, null, null],
    [FOG, false, null, null],
    [FOG, false, null, null],
    [FOG, false, null, null],
  ],
];

// playersState Object<[id, name, color, unitiesCount, landsCount]>
const players = {
  1: [1, "dh", "#ff0000", 1736, 43],
  2: [2, "IDK", "#0a10bf", 896, 25],
};

export { map, players };
