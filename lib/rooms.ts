import { Room, RoomInfo } from './types';
import Point from './point';
import Player from './player';

export const gamerooms: { [key: string]: Room } = {};
export const speedArr: number[] = [0.25, 0.5, 0.75, 1, 2, 3, 4];

const MAX_ROOM_COUNT = 5;
const MAX_ROOM_NAME_LENGTH = 10;
var roomCount = 0;

createRoom('Test Room 1');

export async function getRoomsInfo(): Promise<RoomInfo[]> {
  if (Object.keys(gamerooms).length === 0) {
    return [];
  }
  return Object.values(gamerooms).map((room) => {
    return {
      id: room.id,
      roomName: room.roomName,
      players: room.players.length,
      maxPlayers: room.gameConfig.maxPlayers,
      gameStarted: room.gameStarted,
      gameSpeed: speedArr[room.gameConfig.gameSpeed] + 'x',
    };
  });
}

export async function leaveRoom(roomId: string) {
  try {
    delete gamerooms[roomId];
  } catch (_) {}
}

export async function createRoom(roomName) {
  try {
    if (roomCount > MAX_ROOM_COUNT) throw new Error('Room count exceeded');
    if (roomName.length > 0 && roomName.length < MAX_ROOM_NAME_LENGTH)
      throw new Error('Room name is invalid');
    ++roomCount;
    gamerooms[roomCount] = {
      id: String(roomCount),
      roomName: roomName,
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
  } catch (err) {
    console.log(err);
    return {
      success: false,
      reason: err.message,
    };
  }
}
