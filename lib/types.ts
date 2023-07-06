import Point from './point';
import Player from './player';
import GameMap from './map';

export { Point, Player, GameMap };

export interface UserData {
  name: string;
  color: number;
}

export class Message {
  constructor(
    public player: Player,
    public content: string
  ) {}
}

export interface GameConfig {
  maxPlayers: number;
  gameSpeed: number;
  mapWidth: number;
  mapHeight: number;
  mountain: number;
  city: number;
  swamp: number;
}

export interface Room {
  id: string;
  roomName: string;
  gameStarted: boolean;
  map: GameMap | null;
  gameLoop: any;
  gameConfig: GameConfig;
  forceStartNum: number;
  players: Player[];
  generals: Point[];
  mapGenerated: boolean;
}

export interface RoomInfo {
  id: string;
  roomName: string;
  players: number;
  maxPlayers: number;
  gameStarted: boolean;
  gameSpeed: number; // valid value: [0.25, 0.5, 0.75, 1, 2, 3, 4];
}
