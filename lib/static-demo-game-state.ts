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

export const mapData = [
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

// playersState Object<[id, name, color]>
export const players = {
  1: [1, 'dh', 0],
  2: [2, 'IDK', 1],
};

export const leaderBoardData = [
  { color: 0, username: 'dh', armyCount: 1736, landsCount: 43 },
  { color: 1, username: 'IDK', armyCount: 1233, landsCount: 32 },
]