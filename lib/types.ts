import Point from './point';
import Player from './player';
import GameMap from './map';
export interface UserData {
  name: string;
  color: number;
}

export interface User {
  id: string;
  room: string;
  name: string;
  color: number;
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
  roomName: string;
  gameStarted: boolean;
  map: GameMap | null;
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
  roomName: string;
  players: number;
  maxPlayers: number;
  gameStarted: boolean;
  gameSpeed: number;
}
