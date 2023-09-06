import Point from './point';
import Player from './player';
import GameMap from './map';
import MapDiff from './map-diff';
import GameRecord from './game-record';

export { Point, Player, GameMap, MapDiff };

export interface initGameInfo {
  king: Position;
  mapWidth: number;
  mapHeight: number;
}

export interface SelectedMapTileInfo {
  x: number,
  y: number,
  half: boolean,
  unitsCount: number | null,
}

export interface Position {
  x: number;
  y: number;
}

export interface Route {
  from: Position;
  to: Position;
}

export type LeaderBoardRow = [
  number, // color
  number, // armyCount
  number // landCount
];

export type LeaderBoardTable = LeaderBoardRow[];

export interface UserData {
  id?: string;
  username: string;
  color: number;
}

export class Message {
  constructor(
    public player: UserData,
    public content: string,
    public target?: UserData | null,
    public turn?: number
  ) { }
}

export class Room {
  constructor(
    public id: string,
    public roomName: string = 'Untitled',
    public gameStarted: boolean = false,
    public forceStartNum: number = 0,
    public mapGenerated: boolean = false,
    public maxPlayers: number = 8,
    public gameSpeed: number = 1, // valid value: [0.25, 0.5, 0.75, 1, 2, 3, 4];
    public mapWidth: number = 0.5, // todo 改为实际 map高度，而不是 0-1 的值
    public mapHeight: number = 0.5,
    public mountain: number = 0.5,
    public city: number = 0.5,
    public swamp: number = 0,
    public fogOfWar: boolean = true,
    public deathSpectator: boolean = true, // allow dead player to watch game
    public globalMapDiff: MapDiff | null = null,
    public gameRecord: GameRecord | null = null,
    public map: GameMap | null = null,
    public gameLoop: any = null, // gameLoop function
    public players: Player[] = new Array<Player>(),
    public generals: Point[] = new Array<Point>(),
    public mapId: string = '', // custom Map id
    public mapName: string = '', // custom map name
    public keepAlive: boolean = false, // keep alive after game over
    public revealKing: boolean = false, // reveal all king
    public warringStatesMode: boolean = false, // warring states 战国 mode
  ) { }

  static create(options: Partial<Room>): Room {
    return new Room(
      options.id!,
      options.roomName,
      options.gameStarted,
      options.forceStartNum,
      options.mapGenerated,
      options.maxPlayers,
      options.gameSpeed,
      options.mapWidth,
      options.mapHeight,
      options.mountain,
      options.city,
      options.swamp,
      options.fogOfWar,
      options.deathSpectator,
      options.globalMapDiff,
      options.gameRecord,
      options.map,
      options.gameLoop,
      options.players,
      options.generals,
      options.mapId,
      options.mapName,
      options.keepAlive,
      options.revealKing,
      options.warringStatesMode,
    );
  }

  toJSON() {
    const { gameLoop, generals, ...json } = this;
    return json;
  }
}

export type RoomPool = { [key: string]: Room };

export enum TileType {
  King = 0, // base
  City = 1, // spawner
  Fog = 2, // it's color unit = null
  Obstacle = 3, // Either City or Mountain, which is unknown, it's color unit = null
  Plain = 4, // blank , plain, Neutral, 有数值时，即是army
  Mountain = 5,
  Swamp = 6,
}

export enum RoomUiStatus {
  loading,
  gameRealStarted, // loading over, gameStarted
  gameSetting,
  gameOverConfirm,
}

// when DisplayUnitsCount === null, means it's not revealed by user! set to number to always reveal
// null is only needed when create player view
export type DisplayUnitsCount = number | null;
// color, when color == null, means no player own this tile
export type ColorIndex = number | null;

export type TileProp = [TileType,
  ColorIndex,
  DisplayUnitsCount,
];

export type TilesProp = TileProp[];

export type MapData = TilesProp[];

export type MapDiffData = (number | TileProp)[]; // number: same count, TileProp: diff


export type CustomMapTileData = [TileType,
  ColorIndex,
  number, // unitsCount which is not allow set to null
  boolean, // isAlwaysRevealed
  number, // King Priority
];

export type DisplayCustomMapTileData = [TileType,
  ColorIndex,
  DisplayUnitsCount,
  boolean, // isAlwaysRevealed : is Always Revealed
  number, // King Priority
];

export interface QueueDisplayData {
  className: string; // css class name
  half: boolean; // is half
}

// className: string, text: string
export type MapQueueData = QueueDisplayData[][]; //  same size as MapData

export const TileType2Image: Record<TileType, string> = {
  [TileType.King]: '/img/king.png',
  [TileType.City]: '/img/city.png',
  [TileType.Fog]: '',
  [TileType.Obstacle]: '/img/obstacle.png',
  [TileType.Plain]: '',
  [TileType.Mountain]: '/img/mountain.png',
  [TileType.Swamp]: '/img/swamp.png',
};

export interface SnackState {
  open: boolean;
  status?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number; // auto hide duration
}

export interface GameRecordPerTurn {
  turn: number;
  data: MapDiffData;
  lead: LeaderBoardTable;
}

export type CustomMapData = {
  id: string;
  name: string;
  width: number;
  height: number;
  creator: string;
  description: string;
  mapTilesData: CustomMapTileData[][];
};

export type CustomMapInfo = {
  id: string;
  name: string;
  width: number;
  height: number;
  creator: string;
  description: string;
  createdAt: Date;
  views: number;
  starCount: number;
};