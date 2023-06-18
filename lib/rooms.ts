import { Room, RoomInfo } from "./types";
import Point from './point'
import Player from './player'

export const gamerooms: { [key: string]: Room } = {};

createRoom("test"); // for testing, should be removed

export function getRoomsInfo(): RoomInfo[] {
  if (Object.keys(gamerooms).length === 0) {
    return [];
  }
  return Object.values(gamerooms).map((room) => {
    return {
      id: room.id,
      mapId: room.map?.id,
      players: room.players.length,
      maxPlayers: room.gameConfig.maxPlayers,
      gameStarted: room.gameStarted,
      gameSpeed: room.gameConfig.gameSpeed,
    };
  });
}

export function leaveRoom(roomId: string) {
  delete gamerooms[roomId];
}

export function createRoom(roomId: string) {
  gamerooms[roomId] = {
    id: roomId,
    username: "",
    gameStarted: false,
    map: undefined,
    gameLoop: undefined,
    gameConfig: {
      maxPlayers: 8,
      gameSpeed: 3,
      mapWidth: 0.75,
      mapHeight: 0.75,
      mountain: 0.5,
      city: 0.5,
      swamp: 0,
    },
    players: new Array<Player>(),
    generals: new Array<Point>(),
    forceStartNum: 0,
    mapGenerated: false,
  };
}