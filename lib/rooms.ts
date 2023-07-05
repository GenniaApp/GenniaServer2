import { Room, RoomInfo } from './types';
import Point from './point';
import Player from './player';

export const gamerooms: { [key: string]: Room } = {};

const MAX_ROOM_COUNT = 5;
const MAX_ROOM_NAME_LENGTH = 10;
var roomCount = 0;

createRoom('Test Room 1');

export async function getRoominfo(roomId: string) {
  return gamerooms[roomId];
}

export async function getRoomsInfo(): Promise<RoomInfo[]> {
  if (Object.keys(gamerooms).length === 0) {
    return [];
  }
  return Object.values(gamerooms).map((room) => {
    return {
      id: room.id,
      roomId: room.roomId,
      players: room.players.length,
      maxPlayers: room.gameConfig.maxPlayers,
      gameStarted: room.gameStarted,
      gameSpeed: room.gameConfig.gameSpeed,
    };
  });
}

export async function leaveRoom(roomId: string) {
  try {
    delete gamerooms[roomId];
  } catch (_) {}
}

export async function createRoom(roomId: string) {
  try {
    if (roomCount > MAX_ROOM_COUNT) throw new Error('Room count exceeded');
    if (roomId.length > 0 && roomId.length < MAX_ROOM_NAME_LENGTH)
      throw new Error('Room name is invalid');
    ++roomCount;
    gamerooms[roomCount] = {
      id: String(roomCount),
      roomId: roomId,
      gameStarted: false,
      map: null,
      gameLoop: null,
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
    return {
      success: true,
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      reason: err.message,
    };
  }
}
