import Point from './point';
import Player from './player';
import GameMap from './map';

export { Point, Player, GameMap };


export type LeaderBoardData = {
  color: number;
  username: string;
  armyCount: number;
  landsCount: number;
}[];

export interface UserData {
  name: string;
  color: number;
}

export class Message {
  constructor(
    public player: Player,
    public content: string
  ) { }
}

export class Room {
  constructor(
    public id: string,
    public roomName: string,
    public gameStarted: boolean = false,
    public forceStartNum: number = 0,
    public mapGenerated: boolean = false,
    public maxPlayers: number = 8,
    public gameSpeed: number = 1, // valid value: [0.25, 0.5, 0.75, 1, 2, 3, 4];
    public mapWidth: number = 0.75,
    public mapHeight: number = 0.75,
    public mountain: number = 0.5,
    public city: number = 0.5,
    public swamp: number = 0,

    public map: GameMap | null = null,
    public gameLoop: any = null, // gameLoop function
    public players: Player[] = new Array<Player>(),
    public generals: Point[] = new Array<Point>()
  ) { }

  toJSON() {
    const { map, gameLoop, generals, ...json } = this;
    return json;
  }
}

export type RoomPool = { [key: string]: Room };


export interface MapPosition {
  rowIndex: number;
  columnIndex: number;
}

enum TileType {
  Base = 0,
  Spawner = 1,
  Fog = 2,
  Army = 3,
  Blank = 4,
}

// TileType
// isRevealed {boolean}
// playerId {number}
// unitiesCount {number}
export type TileProp = [TileType, boolean, number, number];

export type TilesProp = TileProp[];

export type MapProp = TilesProp[];

// todo remove these type
// id, name, color
export type PlayerProp = [number, string, number];

export type PlayersProp = Record<number, PlayerProp>;
