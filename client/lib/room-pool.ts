import { Room, RoomPool } from './types';

export const roomPool: RoomPool = {};

const MAX_ROOM_COUNT = 15;
var roomCount = 0;

createRoom('1', 'Test Room 1');

export async function createRoom(roomId: string = '', roomName: string = 'Untitled') {
  try {
    if (Object.keys(roomPool).length > MAX_ROOM_COUNT) throw new Error('Room count exceeded');
    if (!roomId) {
      ++roomCount;
      roomId = String(roomCount);
    }
    roomPool[roomId] = new Room(roomId, roomName);
    return {
      success: true,
      roomId: roomId,
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: err.message,
    };
  }
}
