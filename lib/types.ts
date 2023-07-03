import Point from './point';
import Player from './player';
import GameMap from './map';
export interface UserData {
  name: string;
  picture: string;
}

export interface User {
  id: string;
  room: string;
  name: string;
  picture: string;
}

export interface MessageData {
  body: string;
  senderId: string;
  user: UserData;
}

export interface Message {
  id: string;
  room: string;
  body: string;
  senderId: string;
  user: UserData;
  sentAt: number;
  ownedByCurrentUser?: boolean;
}

export interface Room {
  id: string;
  username: string;
  gameStarted: boolean;
  map: GameMap | undefined;
  gameLoop: any;
  gameConfig: {
    maxPlayers: number;
    gameSpeed: number;
    mapWidth: number;
    mapHeight: number;
    mountain: number;
    city: number;
    swamp: number;
  };
  players: Player[];
  generals: Point[];
  forceStartNum: number;
  mapGenerated: boolean;
}

export interface RoomInfo {
  id: string;
  mapId: string | undefined;
  players: number;
  maxPlayers: number;
  gameStarted: boolean;
  gameSpeed: number;
}
